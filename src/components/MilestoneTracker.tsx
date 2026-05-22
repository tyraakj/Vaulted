import React from "react";
import { Milestone, JobStatus } from "../types";

interface MilestoneTrackerProps {
  milestones?: Milestone[];
  status?: JobStatus;
  onMilestoneSelect?: (milestone: Milestone) => void;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  milestones,
  status,
  onMilestoneSelect,
}) => {
  let displayMilestones: Milestone[] = [];

  if (milestones && milestones.length > 0) {
    displayMilestones = milestones;
  } else {
    const currentStatus = status || "Open";
    displayMilestones = [
      {
        step: 1,
        label: "Contract Posted",
        completed: ["Open", "Active", "Complete", "Released", "Disputed"].includes(currentStatus),
      },
      {
        step: 2,
        label: "Freelancer Accepted",
        completed: ["Active", "Complete", "Released", "Disputed"].includes(currentStatus),
      },
      {
        step: 3,
        label: "Work Submitted",
        completed: ["Complete", "Released"].includes(currentStatus),
      },
      {
        step: 4,
        label: currentStatus === "Disputed" ? "Contract Disputed" : "Payment Released",
        completed: ["Released"].includes(currentStatus),
      },
    ];
  }

  return (
    <div className="milestone-tracker">
      <h3>Milestones</h3>
      <div className="milestone-steps">
        {displayMilestones.map((m) => (
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
