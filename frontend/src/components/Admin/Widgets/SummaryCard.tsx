import React from "react";
import { Link } from "react-router-dom";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  to?: string;
  className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, to, className = "summaryBox" }) => {
  const content = (
    <>
      {icon && <div className="boxIcon">{icon}</div>}
      <div className="boxContent">
        <p>{title}</p>
        <span>{value}</span>
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

export default SummaryCard;
