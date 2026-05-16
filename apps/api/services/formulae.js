/**
 * PulseGoals — Progress Score Computation
 * Implements exact formulas per UoM type as specified.
 */

function computeProgressScore(uomType, target, achievement) {
  switch (uomType) {
    case 'MIN': {
      // Higher is better (Sales, Revenue)
      const t = parseFloat(target);
      const a = parseFloat(achievement);
      if (!t || isNaN(a)) return 0;
      return Math.min((a / t) * 100, 100);
    }

    case 'MAX': {
      // Lower is better (TAT, Cost)
      const t = parseFloat(target);
      const a = parseFloat(achievement);
      if (isNaN(a)) return 0;
      if (a === 0) return 100;
      return Math.min((t / a) * 100, 100);
    }

    case 'TIMELINE': {
      // Date-based: 100% if on/before deadline, proportional if late
      const deadline = new Date(target);
      const completionDate = new Date(achievement);
      if (!achievement || isNaN(completionDate.getTime())) return 0;
      if (completionDate <= deadline) return 100;
      const daysLate = (completionDate - deadline) / (1000 * 60 * 60 * 24);
      return Math.max(0, 100 - daysLate * 10);
    }

    case 'ZERO': {
      // Zero = success (e.g., zero defects)
      const a = parseFloat(achievement);
      return a === 0 ? 100 : 0;
    }

    default:
      return 0;
  }
}

// Compute weighted score for an entire goal sheet
function computeWeightedScore(goals) {
  if (!goals || goals.length === 0) return 0;
  let totalWeightedScore = 0;
  let totalWeightage = 0;

  for (const goal of goals) {
    if (goal.achievements && goal.achievements.length > 0) {
      const latestAchievement = goal.achievements[goal.achievements.length - 1];
      const score = latestAchievement.progressScore || 0;
      totalWeightedScore += score * (goal.weightage / 100);
      totalWeightage += goal.weightage;
    }
  }

  return totalWeightage > 0 ? Math.round(totalWeightedScore * 100) / 100 : 0;
}

module.exports = { computeProgressScore, computeWeightedScore };
