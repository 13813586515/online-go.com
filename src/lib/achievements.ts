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

import { AchievementDefinition, AchievementCategory, UserAchievement } from "./types";

export type { AchievementDefinition, AchievementCategory, UserAchievement };

export const ACHIEVEMENT_DEFINITIONS: { [key: string]: AchievementDefinition } = {
    "first-game": {
        id: "first-game",
        name: "初出茅庐",
        description: "完成你的第一盘围棋对局",
        category: "novice",
        rarity: "common",
    },
    "first-capture": {
        id: "first-capture",
        name: "初试锋芒",
        description: "在对局中第一次吃掉对方的棋子",
        category: "novice",
        rarity: "common",
    },
    "first-life": {
        id: "first-life",
        name: "生机盎然",
        description: "在对局中成功做出活棋",
        category: "novice",
        rarity: "common",
    },
    "winning-streak-5": {
        id: "winning-streak-5",
        name: "势如破竹",
        description: "在对局中取得五连胜",
        category: "technical",
        rarity: "uncommon",
    },
    "puzzle-master-100": {
        id: "puzzle-master-100",
        name: "死活宗师",
        description: "完成100道死活题",
        category: "technical",
        rarity: "uncommon",
    },
    "comeback-victory": {
        id: "comeback-victory",
        name: "逆转乾坤",
        description: "在明显劣势的情况下逆转获胜",
        category: "technical",
        rarity: "rare",
    },
    "join-group": {
        id: "join-group",
        name: "志同道合",
        description: "加入一个围棋群组",
        category: "social",
        rarity: "common",
    },
    "create-club": {
        id: "create-club",
        name: "开山立派",
        description: "创建一个围棋俱乐部",
        category: "social",
        rarity: "uncommon",
    },
    "ten-reviews": {
        id: "ten-reviews",
        name: "诲人不倦",
        description: "发表10篇棋谱复盘",
        category: "social",
        rarity: "uncommon",
    },
    "instant-win": {
        id: "instant-win",
        name: "闪电一击",
        description: "在1秒内落子并获胜",
        category: "rare",
        rarity: "legendary",
    },
    "handicap-perfect": {
        id: "handicap-perfect",
        name: "以弱胜强",
        description: "在让子棋中全胜对手",
        category: "rare",
        rarity: "legendary",
    },
};

export const CATEGORY_NAMES: { [key in AchievementCategory]: string } = {
    novice: "新手成就",
    technical: "技术成就",
    social: "社交成就",
    rare: "稀有成就",
};

export const CATEGORY_ICONS: { [key in AchievementCategory]: string } = {
    novice: "fa-star",
    technical: "fa-trophy",
    social: "fa-users",
    rare: "fa-diamond",
};

export function getAchievementDefinition(name: string): AchievementDefinition | undefined {
    if (name in ACHIEVEMENT_DEFINITIONS) {
        return ACHIEVEMENT_DEFINITIONS[name];
    }
    return undefined;
}

export function getAchievementCategory(name: string): AchievementCategory {
    const def = getAchievementDefinition(name);
    if (def) {
        return def.category;
    }
    if (name.startsWith("wsc") || name.startsWith("wdc")) {
        return "rare";
    }
    return "novice";
}

export function groupAchievementsByCategory(
    achievements: UserAchievement[],
): { [key in AchievementCategory]: UserAchievement[] } {
    const grouped: { [key in AchievementCategory]: UserAchievement[] } = {
        novice: [],
        technical: [],
        social: [],
        rare: [],
    };

    for (const achievement of achievements) {
        const category = getAchievementCategory(achievement.name);
        grouped[category].push(achievement);
    }

    return grouped;
}

export function formatAchievementTimestamp(timestamp: string): string {
    try {
        const date = new Date(timestamp);
        return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return timestamp;
    }
}

export function getRarityColor(rarity?: string): string {
    switch (rarity) {
        case "common":
            return "#9ca3af";
        case "uncommon":
            return "#10b981";
        case "rare":
            return "#3b82f6";
        case "legendary":
            return "#f59e0b";
        default:
            return "#9ca3af";
    }
}

export function getRarityName(rarity?: string): string {
    switch (rarity) {
        case "common":
            return "普通";
        case "uncommon":
            return "稀有";
        case "rare":
            return "珍贵";
        case "legendary":
            return "传说";
        default:
            return "普通";
    }
}
