import React from "react";
import { Milestone } from "../types";

interface MilestoneTrackerProps {
  milestones: Milestone[];
  onMilestoneSelect?: (milestone: Milestone) => void;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  milestones,
  onMilestoneSelect,
}) => {
  return (
    <div className="milestone-tracker">
      <h3>Milestones</h3>
      <div className="milestone-steps">
        {milestones.map((m) => (
          <div
            key={m.step}
            className={`milestone-step ${m.completed ? "completed" : "pending"}`}
            onClick={() => onMilestoneSelect?.(m)}
          >
            <div className="step-index">{m.step}</div>
            <div className="step-label">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
