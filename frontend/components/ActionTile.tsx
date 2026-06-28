"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type ActionTileProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "orange" | "blue" | "sky" | "green";
  onClick?: () => void;
  href?: string;
};

export function ActionTile({ title, description, icon: Icon, tone, onClick, href }: ActionTileProps) {
  const content = (
    <>
      <span className={`tile-icon ${tone}`}>
        <Icon size={28} />
      </span>
      <span className="tile-title">{title}</span>
      <span className="tile-description">{description}</span>
    </>
  );

  if (href) {
    return (
      <Link className="action-tile" href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className="action-tile" onClick={onClick} type="button">
      {content}
    </button>
  );
}
