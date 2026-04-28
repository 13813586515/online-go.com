/*
 * Copyright (C)  Online-Go.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from "react";
import {
    UserAchievement,
    getAchievementDefinition,
    groupAchievementsByCategory,
    CATEGORY_NAMES,
    CATEGORY_ICONS,
    formatAchievementTimestamp,
    getRarityColor,
    getRarityName,
} from "@/lib/achievements";
import { _, pgettext } from "@/lib/translate";
import { Card } from "@/components/material";
import "./AchievementList.css";

interface AchievementListProps {
    list: Array<UserAchievement>;
    onAchievementClick?: (achievement: UserAchievement) => void;
}

export function AchievementList({ list, onAchievementClick }: AchievementListProps): React.ReactElement {
    const grouped = groupAchievementsByCategory(list);
    const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());

    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const renderCategory = (category: string, achievements: UserAchievement[]) => {
        if (achievements.length === 0) {
            return null;
        }

        const isExpanded = expandedCategories.has(category) || expandedCategories.size === 0;
        const icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || "fa-trophy";
        const name = CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES] || category;

        return (
            <div key={category} className="AchievementCategory">
                <div
                    className="category-header"
                    onClick={() => toggleCategory(category)}
                >
                    <i className={`fa ${icon}`}></i>
                    <span className="category-name">{name}</span>
                    <span className="category-count">({achievements.length})</span>
                    <span className="toggle-icon">{isExpanded ? "▼" : "▶"}</span>
                </div>
                {isExpanded && (
                    <div className="category-achievements">
                        {achievements.map((achievement) =>
                            render_achievement_entry(achievement, onAchievementClick),
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="AchievementList">
            {renderCategory("novice", grouped.novice)}
            {renderCategory("technical", grouped.technical)}
            {renderCategory("social", grouped.social)}
            {renderCategory("rare", grouped.rare)}
        </div>
    );
}

function render_achievement_entry(
    entry: UserAchievement,
    onClick?: (achievement: UserAchievement) => void,
): React.ReactElement {
    const def = getAchievementDefinition(entry.name);
    let title = "";
    let description = "";
    let category = "novice";
    let rarity: string | undefined;

    if (def) {
        title = def.name;
        description = def.description;
        category = def.category;
        rarity = def.rarity;
    } else {
        switch (entry.name) {
            case "wdc2021":
                title = "Western Dan Challenge Contender";
                description = "Played 100 or more games during the 2021 Western Dan Challenge";
                category = "rare";
                break;
            case "wsc2022":
                title = "Western Server Challenge Contender";
                description = "Played 100 or more games during the 2022 Western Server Challenge";
                category = "rare";
                break;
            case "wsc2023":
                title = "Western Server Challenge Contender";
                description = "Played 100 or more games during the 2023 Western Server Challenge";
                category = "rare";
                break;
            case "wsc2024":
                title = "Western Server Challenge Contender";
                description = "Played 100 or more games during the 2024 Western Server Challenge";
                category = "rare";
                break;
            case "wsc2025":
                title = "Western Server Challenge Contender";
                description = "Played 100 or more games during the 2025 Western Server Challenge";
                category = "rare";
                break;
            case "wsc2025-grand-slam":
                title = "Western Server Challenge Grand Slam";
                description =
                    "Played 100 or more games on each size during the 2025 Western Server Challenge";
                category = "rare";
                rarity = "legendary";
                break;
            case "wsc2026":
                title = "Western Server Challenge Contender";
                description = "Played 100 or more games during the 2026 Western Server Challenge";
                category = "rare";
                break;
            case "wsc2026-grand-slam":
                title = "Western Server Challenge Grand Slam";
                description =
                    "Played 100 or more games on each size during the 2026 Western Server Challenge";
                category = "rare";
                rarity = "legendary";
                break;
            default:
                title = entry.name;
                description = "";
        }
    }

    const handleClick = () => {
        if (onClick) {
            onClick(entry);
        }
    };

    const hasLink = !!(entry.game_id || entry.puzzle_id || entry.group_id || entry.review_id);
    const className = [
        "AchievementEntry",
        entry.name,
        category,
        rarity ? `rarity-${rarity}` : "",
        onClick ? "clickable" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div key={entry.name + "-" + entry.nth_time_awarded} className={className} onClick={handleClick}>
            <div className="icon-wrapper">
                <span className="icon" />
                {rarity && <div className="rarity-badge" style={{ borderColor: getRarityColor(rarity) }}>
                    {getRarityName(rarity)}
                </div>}
            </div>
            <div className="achievement-info">
                <div className="title-row">
                    <div className="title">{title}</div>
                    {entry.timestamp && (
                        <div className="timestamp">{formatAchievementTimestamp(entry.timestamp)}</div>
                    )}
                </div>
                <div className="description">{description}</div>
                {entry.progress > 0 && entry.progress < 100 && (
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${entry.progress}%` }} />
                        <span className="progress-text">{entry.progress}%</span>
                    </div>
                )}
                {hasLink && (
                    <div className="link-indicator">
                        <i className="fa fa-external-link"></i>
                        {pgettext("Indicator that achievement has associated game/review to view", "查看详情")}
                    </div>
                )}
            </div>
        </div>
    );
}

interface AchievementDetailModalProps {
    achievement: UserAchievement | null;
    onClose: () => void;
}

export function AchievementDetailModal({
    achievement,
    onClose,
}: AchievementDetailModalProps): React.ReactElement | null {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        if (achievement) {
            setIsOpen(true);
        }
    }, [achievement]);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(onClose, 300);
    };

    if (!achievement) {
        return null;
    }

    const def = getAchievementDefinition(achievement.name);

    const getLink = () => {
        if (achievement.game_id) {
            return `/game/${achievement.game_id}`;
        }
        if (achievement.puzzle_id) {
            return `/puzzle/${achievement.puzzle_id}`;
        }
        if (achievement.group_id) {
            return `/group/${achievement.group_id}`;
        }
        if (achievement.review_id) {
            return `/review/${achievement.review_id}`;
        }
        return null;
    };

    const link = getLink();

    return (
        <div className={`AchievementDetailModal ${isOpen ? "open" : ""}`}>
            <div className="modal-overlay" onClick={handleClose}></div>
            <div className="modal-content">
                <div className="modal-header">
                    <button className="close-button" onClick={handleClose}>
                        <i className="fa fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="achievement-icon-large">
                        <span className={`icon ${achievement.name}`} />
                    </div>
                    <h2 className="achievement-title">{def?.name || achievement.name}</h2>
                    {def?.rarity && (
                        <div
                            className="rarity-label"
                            style={{ color: getRarityColor(def.rarity) }}
                        >
                            {getRarityName(def.rarity)}
                        </div>
                    )}
                    <p className="achievement-description">{def?.description || ""}</p>
                    {achievement.timestamp && (
                        <div className="achievement-date">
                            <i className="fa fa-calendar"></i>
                            <span>{_("获得时间")}: {formatAchievementTimestamp(achievement.timestamp)}</span>
                        </div>
                    )}
                    {achievement.details && (
                        <div className="achievement-details">
                            <i className="fa fa-info-circle"></i>
                            <span>{achievement.details}</span>
                        </div>
                    )}
                    {link && (
                        <a href={link} className="view-game-link">
                            <i className="fa fa-external-link"></i>
                            {pgettext("Link to view game/review associated with achievement", "查看相关棋谱")}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
