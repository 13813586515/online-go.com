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

declare namespace rest_api {
    interface CoachingRelationship {
        id: number;
        coach: PlayerCacheEntry;
        student: PlayerCacheEntry;
        status: "pending" | "active" | "rejected" | "terminated";
        created: string;
        started?: string;
        ended?: string;
        note?: string;
    }

    interface CoachingGameReviewRequest {
        id: number;
        student: PlayerCacheEntry;
        coach: PlayerCacheEntry;
        game: Game;
        status: "pending" | "reviewing" | "completed" | "declined";
        created: string;
        completed?: string;
        student_note?: string;
        coach_note?: string;
        review_id?: number;
    }

    interface CoachingAssignment {
        id: number;
        coach: PlayerCacheEntry;
        student: PlayerCacheEntry;
        title: string;
        description: string;
        game_id?: number;
        game?: Game;
        sgf?: string;
        questions: CoachingAssignmentQuestion[];
        status: "draft" | "assigned" | "started" | "completed" | "reviewed";
        created: string;
        assigned?: string;
        due_date?: string;
        completed?: string;
    }

    interface CoachingAssignmentQuestion {
        id: number;
        text: string;
        move_number?: number;
        position?: string;
        answer_type: "text" | "move" | "variation" | "multiple_choice";
        options?: string[];
        correct_answer?: string;
        student_answer?: string;
        coach_feedback?: string;
        score?: number;
    }

    interface CoachingAssignmentSubmission {
        id: number;
        assignment: CoachingAssignment;
        student: PlayerCacheEntry;
        answers: CoachingAssignmentQuestion[];
        submitted: string;
        score?: number;
        feedback?: string;
        reviewed?: string;
    }

    interface CoachingMessage {
        id: number;
        from: PlayerCacheEntry;
        to: PlayerCacheEntry;
        message: string;
        created: string;
        read: boolean;
        read_at?: string;
        attachment_type?: "game" | "review" | "assignment" | "none";
        attachment_id?: number;
    }

    interface CoachingStats {
        coach_id: number;
        student_count: number;
        active_student_count: number;
        pending_requests_count: number;
        pending_reviews_count: number;
        assignments_count: number;
        completed_assignments_count: number;
    }

    interface StudentCoachingStats {
        student_id: number;
        coach_count: number;
        active_coach_count: number;
        pending_requests_count: number;
        review_requests_count: number;
        completed_reviews_count: number;
        assignments_count: number;
        completed_assignments_count: number;
    }
}
