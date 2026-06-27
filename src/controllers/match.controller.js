import User from "../models/User.model.js";
import { aiPersonalizedMatch } from "../services/aiService.js";
const normalizeSkill = (skill = "") =>
  skill.toLowerCase().replace(".js", "").trim();
export const matchUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    const users = await User.find({ 
      _id: { $ne: req.user.id } ,
      phoneVerified: true,
        isAdmin: { $ne: true }

    });

    if (!currentUser || users.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Prepare AI input
    const aiInputUsers = users.map((u) => ({
      id: String(u._id),
      offers: u.offers || [],
      needs: u.needs || [],
      availability: u.availability || [],
    }));

    let aiResults = [];

    try {
      aiResults = await aiPersonalizedMatch(
        {
          offers: currentUser.offers || [],
          needs: currentUser.needs || [],
          availability: currentUser.availability || [],
        },
        aiInputUsers
      );
    } catch (err) {
      console.log("AI failed → fallback used");
    }

    // Merge AI + fallback
    const finalMatches = users.map((user) => {
      const aiMatch = aiResults.find(
        (m) => String(m.userId) === String(user._id)
      );

      let matchScore = aiMatch?.match || 0;
      let reason = aiMatch?.reason || "";

      // fallback logic
// fallback logic
if (matchScore === 0) {
  let score = 0;

  // User offers skills that current user needs
const offerNeedMatches =
  user.offers?.filter((skill) =>
    currentUser.needs?.some(
      (need) =>
        normalizeSkill(need) ===
        normalizeSkill(skill)
    )
  ).length || 0;

  // User needs skills that current user offers
  const needOfferMatches =
  user.needs?.filter((skill) =>
    currentUser.offers?.some(
      (offer) =>
        normalizeSkill(offer) ===
        normalizeSkill(skill)
    )
  ).length || 0;

  // Up to 50 points
  score += Math.min(offerNeedMatches * 25, 50);

  // Up to 30 points
  score += Math.min(needOfferMatches * 15, 30);

  // Availability overlap
  const availabilityMatches =
    user.availability?.filter((slot) =>
      currentUser.availability?.includes(slot)
    ).length || 0;

  if (availabilityMatches > 0) {
    score += 10;
  }

  // Rating bonus
  if (user.rating > 4) {
    score += 10;
  }


  matchScore = Math.min(score, 100);

  reason = `${offerNeedMatches} skill exchange`;
}

      return {
        id: user._id,
        match: Math.min(matchScore, 100),
        reason,
      };
    });

    finalMatches.sort((a, b) => b.match - a.match);

    res.json({
      success: true,
      data: finalMatches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};