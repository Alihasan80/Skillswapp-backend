import User from "../models/User.model.js";
import { aiPersonalizedMatch } from "../services/aiService.js";

export const matchUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    
    const otherUsers = await User.find({
      _id: { $ne: currentUserId },
    });

    // Filter
    const filteredUsers = otherUsers.filter((u) =>
      u.offers?.some((s) => currentUser.needs?.includes(s))
    );

    const formattedCurrentUser = {
      id: currentUser._id.toString(),
      offers: currentUser.offers || [],
      needs: currentUser.needs || [],
    };

    const formattedUsers = filteredUsers.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      offers: u.offers || [],
      needs: u.needs || [],
    }));

    // AI call
    const aiResults = await aiPersonalizedMatch(
      formattedCurrentUser,
      formattedUsers
    );

    // Merge
    const finalUsers = formattedUsers.map((u) => {
      const match = aiResults.find((m) => m.userId === u.id);

      return {
        ...u,
        match: match?.match || 0,
        reason: match?.reason || "",
      };
    });

    finalUsers.sort((a, b) => b.match - a.match);

    res.json({ success: true, data: finalUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};