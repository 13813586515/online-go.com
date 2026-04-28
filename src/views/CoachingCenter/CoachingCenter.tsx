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
import { useNavigate, useParams, Link } from "react-router-dom";
import { _, pgettext, interpolate } from "@/lib/translate";
import { get, post, put, del } from "@/lib/requests";
import * as data from "@/lib/data";
import { Card } from "@/components/material";
import { Player } from "@/components/Player";
import { PaginatedTable } from "@/components/PaginatedTable";
import { PlayerAutocomplete } from "@/components/PlayerAutocomplete";
import { PlayerCacheEntry } from "@/lib/player_cache";
import { errorAlerter } from "@/lib/misc";
import { alert } from "@/lib/swal_config";
import "./CoachingCenter.css";

type TabType = "overview" | "students" | "games" | "reviews" | "assignments" | "chat" | "coaches";

export function CoachingCenter(): React.ReactElement {
    const params = useParams();
    const navigate = useNavigate();
    const user = data.get("user");

    const [activeTab, setActiveTab] = React.useState<TabType>("overview");
    const [stats, setStats] = React.useState<rest_api.CoachingStats | rest_api.StudentCoachingStats | null>(null);
    const [isCoach, setIsCoach] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const coachStats = await get("coaching/stats/coach");
            const studentStats = await get("coaching/stats/student");

            setIsCoach(coachStats.student_count > 0 || coachStats.active_student_count > 0);
            setStats({ ...coachStats, ...studentStats } as any);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="CoachingCenter container">
                <Card>
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                        {_("Loading...")}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="CoachingCenter container">
            <div className="tabs">
                <button
                    className={activeTab === "overview" ? "active" : ""}
                    onClick={() => setActiveTab("overview")}
                >
                    {_("Overview")}
                </button>
                {isCoach && (
                    <>
                        <button
                            className={activeTab === "students" ? "active" : ""}
                            onClick={() => setActiveTab("students")}
                        >
                            {_("Students")}
                        </button>
                        <button
                            className={activeTab === "games" ? "active" : ""}
                            onClick={() => setActiveTab("games")}
                        >
                            {_("Student Games")}
                        </button>
                    </>
                )}
                <button
                    className={activeTab === "reviews" ? "active" : ""}
                    onClick={() => setActiveTab("reviews")}
                >
                    {_("Reviews")}
                </button>
                <button
                    className={activeTab === "assignments" ? "active" : ""}
                    onClick={() => setActiveTab("assignments")}
                >
                    {_("Assignments")}
                </button>
                <button
                    className={activeTab === "chat" ? "active" : ""}
                    onClick={() => setActiveTab("chat")}
                >
                    {_("Chat")}
                </button>
                {!isCoach && (
                    <button
                        className={activeTab === "coaches" ? "active" : ""}
                        onClick={() => setActiveTab("coaches")}
                    >
                        {_("My Coaches")}
                    </button>
                )}
            </div>

            <div className="tab-content">
                {activeTab === "overview" && <OverviewTab stats={stats} isCoach={isCoach} />}
                {activeTab === "students" && isCoach && <StudentsTab onRefresh={loadStats} />}
                {activeTab === "games" && isCoach && <StudentGamesTab />}
                {activeTab === "reviews" && <ReviewsTab isCoach={isCoach} />}
                {activeTab === "assignments" && <AssignmentsTab isCoach={isCoach} />}
                {activeTab === "chat" && <ChatTab isCoach={isCoach} />}
                {activeTab === "coaches" && !isCoach && <CoachesTab onRefresh={loadStats} />}
            </div>
        </div>
    );
}

interface OverviewTabProps {
    stats: rest_api.CoachingStats | rest_api.StudentCoachingStats | null;
    isCoach: boolean;
}

function OverviewTab({ stats, isCoach }: OverviewTabProps): React.ReactElement {
    return (
        <div className="overview">
            <div className="stats-grid">
                {isCoach ? (
                    <>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">
                                    {(stats as rest_api.CoachingStats)?.active_student_count || 0}
                                </div>
                                <div className="stat-label">{_("Active Students")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">
                                    {(stats as rest_api.CoachingStats)?.pending_requests_count || 0}
                                </div>
                                <div className="stat-label">{_("Pending Requests")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">
                                    {(stats as rest_api.CoachingStats)?.pending_reviews_count || 0}
                                </div>
                                <div className="stat-label">{_("Pending Reviews")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">
                                    {(stats as rest_api.CoachingStats)?.assignments_count || 0}
                                </div>
                                <div className="stat-label">{_("Assignments")}</div>
                            </div>
                        </Card>
                    </>
                ) : (
                    <>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">
                                    {(stats as rest_api.StudentCoachingStats)?.active_coach_count || 0}
                                </div>
                                <div className="stat-label">{_("Active Coaches")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">
                                    {(stats as rest_api.StudentCoachingStats)?.pending_requests_count || 0}
                                </div>
                                <div className="stat-label">{_("Pending Requests")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">
                                    {(stats as rest_api.StudentCoachingStats)?.review_requests_count || 0}
                                </div>
                                <div className="stat-label">{_("Review Requests")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">
                                    {(stats as rest_api.StudentCoachingStats)?.assignments_count || 0}
                                </div>
                                <div className="stat-label">{_("Assignments")}</div>
                            </div>
                        </Card>
                    </>
                )}
            </div>

            <div className="quick-actions">
                <h3>{_("Quick Actions")}</h3>
                {isCoach ? (
                    <div className="action-buttons">
                        <Link to="/group/create" className="primary">
                            {_("Invite New Student")}
                        </Link>
                        <Link to="/coaching/assignments/new" className="primary">
                            {_("Create Assignment")}
                        </Link>
                    </div>
                ) : (
                    <div className="action-buttons">
                        <Link to="/players" className="primary">
                            {_("Find a Coach")}
                        </Link>
                        <RequestReviewButton />
                    </div>
                )}
            </div>
        </div>
    );
}

function RequestReviewButton(): React.ReactElement {
    const [showModal, setShowModal] = React.useState(false);
    const [selectedGame, setSelectedGame] = React.useState<number | null>(null);
    const [note, setNote] = React.useState("");

    const handleSubmit = () => {
        if (!selectedGame) {
            alert.fire({ title: _("Please select a game") });
            return;
        }
        post("coaching/review-requests", {
            game_id: selectedGame,
            note: note,
        })
            .then(() => {
                alert.fire({ title: _("Review request sent!") });
                setShowModal(false);
                setSelectedGame(null);
                setNote("");
            })
            .catch(errorAlerter);
    };

    return (
        <>
            <button className="primary" onClick={() => setShowModal(true)}>
                {_("Request Game Review")}
            </button>
            {showModal && (
                <div className="modal-overlay">
                    <Card className="modal">
                        <h3>{_("Request Game Review")}</h3>
                        <div className="form-group">
                            <label>{_("Select Game")}</label>
                            <GameSelector
                                value={selectedGame}
                                onChange={setSelectedGame}
                            />
                        </div>
                        <div className="form-group">
                            <label>{_("Note to Coach")}</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={_("Any specific areas you'd like reviewed?")}
                                rows={4}
                            />
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowModal(false)}>
                                {_("Cancel")}
                            </button>
                            <button className="primary" onClick={handleSubmit}>
                                {_("Send Request")}
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}

interface GameSelectorProps {
    value: number | null;
    onChange: (id: number | null) => void;
}

function GameSelector({ value, onChange }: GameSelectorProps): React.ReactElement {
    const [games, setGames] = React.useState<rest_api.Game[]>([]);
    const user = data.get("user");

    React.useEffect(() => {
        get(`players/${user.id}/game_history/`, { page_size: 20 })
            .then((res: any) => setGames(res.results))
            .catch(errorAlerter);
    }, []);

    return (
        <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        >
            <option value="">{_("Select a game...")}</option>
            {games.map((game) => (
                <option key={game.id} value={game.id}>
                    {game.name || `Game #${game.id}`} - {game.players.black.username} vs {game.players.white.username}
                </option>
            ))}
        </select>
    );
}

interface StudentsTabProps {
    onRefresh: () => void;
}

function StudentsTab({ onRefresh }: StudentsTabProps): React.ReactElement {
    const [showInvite, setShowInvite] = React.useState(false);
    const [selectedStudent, setSelectedStudent] = React.useState<PlayerCacheEntry | null>(null);
    const [inviteNote, setInviteNote] = React.useState("");

    const groomRelationships = (results: rest_api.CoachingRelationship[]): any[] => {
        return results.map((r) => ({
            ...r,
            href: `/player/${r.student.id}`,
        }));
    };

    const handleInvite = () => {
        if (!selectedStudent) {
            alert.fire({ title: _("Please select a student") });
            return;
        }
        post("coaching/relationships", {
            student_id: selectedStudent.id,
            note: inviteNote,
        })
            .then(() => {
                alert.fire({ title: _("Invitation sent!") });
                setShowInvite(false);
                setSelectedStudent(null);
                setInviteNote("");
                onRefresh();
            })
            .catch(errorAlerter);
    };

    const handleAccept = (id: number) => {
        put(`coaching/relationships/${id}`, { status: "active" })
            .then(() => onRefresh())
            .catch(errorAlerter);
    };

    const handleReject = (id: number) => {
        put(`coaching/relationships/${id}`, { status: "rejected" })
            .then(() => onRefresh())
            .catch(errorAlerter);
    };

    const handleTerminate = (id: number) => {
        alert
            .fire({
                text: _("Are you sure you want to end this coaching relationship?"),
                showCancelButton: true,
                focusCancel: true,
            })
            .then(({ value: accept }) => {
                if (accept) {
                    put(`coaching/relationships/${id}`, { status: "terminated" })
                        .then(() => onRefresh())
                        .catch(errorAlerter);
                }
            });
    };

    return (
        <div className="students-tab">
            <div className="tab-header">
                <h2>{_("My Students")}</h2>
                <button className="primary" onClick={() => setShowInvite(true)}>
                    {_("Invite Student")}
                </button>
            </div>

            {showInvite && (
                <Card className="invite-form">
                    <h3>{_("Invite New Student")}</h3>
                    <div className="form-group">
                        <label>{_("Select Player")}</label>
                        <PlayerAutocomplete onComplete={setSelectedStudent} />
                        {selectedStudent && (
                            <div className="selected-player">
                                <Player user={selectedStudent} icon />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>{_("Message")}</label>
                        <textarea
                            value={inviteNote}
                            onChange={(e) => setInviteNote(e.target.value)}
                            placeholder={_("Personal message to the student...")}
                            rows={3}
                        />
                    </div>
                    <div className="form-actions">
                        <button onClick={() => setShowInvite(false)}>
                            {_("Cancel")}
                        </button>
                        <button className="primary" onClick={handleInvite}>
                            {_("Send Invitation")}
                        </button>
                    </div>
                </Card>
            )}

            <div className="section">
                <h3>{_("Pending Invitations")}</h3>
                <PaginatedTable
                    name="pending-students"
                    source="coaching/relationships"
                    filter={{ status: "pending" }}
                    groom={groomRelationships}
                    columns={[
                        {
                            header: _("Student"),
                            render: (r) => <Player user={r.student} icon />,
                        },
                        {
                            header: _("Status"),
                            render: (r) => <span className={`status-${r.status}`}>{r.status}</span>,
                        },
                        {
                            header: _("Actions"),
                            render: (r) => (
                                <div className="action-buttons">
                                    <button
                                        className="sm primary"
                                        onClick={() => handleAccept(r.id)}
                                    >
                                        {_("Accept")}
                                    </button>
                                    <button
                                        className="sm danger"
                                        onClick={() => handleReject(r.id)}
                                    >
                                        {_("Reject")}
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>

            <div className="section">
                <h3>{_("Active Students")}</h3>
                <PaginatedTable
                    name="active-students"
                    source="coaching/relationships"
                    filter={{ status: "active" }}
                    groom={groomRelationships}
                    columns={[
                        {
                            header: _("Student"),
                            render: (r) => <Player user={r.student} icon />,
                        },
                        {
                            header: _("Since"),
                            render: (r) => r.started || r.created,
                        },
                        {
                            header: _("Actions"),
                            render: (r) => (
                                <div className="action-buttons">
                                    <Link
                                        to={`/coaching/games?student=${r.student.id}`}
                                        className="sm"
                                    >
                                        {_("View Games")}
                                    </Link>
                                    <Link
                                        to={`/coaching/chat?student=${r.student.id}`}
                                        className="sm"
                                    >
                                        {_("Chat")}
                                    </Link>
                                    <button
                                        className="sm danger"
                                        onClick={() => handleTerminate(r.id)}
                                    >
                                        {_("End")}
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}

function StudentGamesTab(): React.ReactElement {
    const [selectedStudent, setSelectedStudent] = React.useState<number | null>(null);
    const [relationships, setRelationships] = React.useState<rest_api.CoachingRelationship[]>([]);

    React.useEffect(() => {
        get("coaching/relationships", { status: "active" })
            .then((res: any) => setRelationships(res.results))
            .catch(errorAlerter);
    }, []);

    const groomGames = (results: rest_api.Game[]): any[] => {
        return results.map((g) => ({
            ...g,
            href: `/game/${g.id}`,
        }));
    };

    return (
        <div className="student-games-tab">
            <div className="tab-header">
                <h2>{_("Student Games")}</h2>
                <select
                    value={selectedStudent || ""}
                    onChange={(e) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : null)}
                >
                    <option value="">{_("All Students")}</option>
                    {relationships.map((r) => (
                        <option key={r.student.id} value={r.student.id}>
                            {r.student.username}
                        </option>
                    ))}
                </select>
            </div>

            <Card>
                <PaginatedTable
                    name="student-games"
                    source={selectedStudent ? `players/${selectedStudent}/game_history/` : "coaching/student-games/"}
                    groom={groomGames}
                    orderBy={["-ended"]}
                    columns={[
                        {
                            header: _("Student"),
                            render: (g) => {
                                const user = data.get("user");
                                const studentId = g.players.black.id === user.id ? g.players.white.id : g.players.black.id;
                                const student = g.players.black.id === user.id ? g.players.white : g.players.black;
                                return <Player user={student} icon />;
                            },
                        },
                        {
                            header: _("Game"),
                            render: (g) => (
                                <Link to={`/game/${g.id}`}>
                                    {g.name || `Game #${g.id}`}
                                </Link>
                            ),
                        },
                        {
                            header: _("Opponent"),
                            render: (g) => {
                                const user = data.get("user");
                                const opponent = g.players.black.id === user.id ? g.players.white : g.players.black;
                                return <Player user={opponent} icon />;
                            },
                        },
                        {
                            header: _("Result"),
                            render: (g) => {
                                const blackWon = !g.black_lost && g.white_lost;
                                const whiteWon = !g.white_lost && g.black_lost;
                                if (blackWon) {
                                    return <span className="won">{_("Black won")}</span>;
                                }
                                if (whiteWon) {
                                    return <span className="won">{_("White won")}</span>;
                                }
                                return <span>{g.outcome}</span>;
                            },
                        },
                        {
                            header: _("Date"),
                            render: (g) => g.ended,
                        },
                        {
                            header: _("Actions"),
                            render: (g) => (
                                <div className="action-buttons">
                                    <Link to={`/game/${g.id}`} className="sm">
                                        {_("View")}
                                    </Link>
                                    <Link to={`/review/new?game=${g.id}`} className="sm primary">
                                        {_("Review")}
                                    </Link>
                                </div>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
}

interface ReviewsTabProps {
    isCoach: boolean;
}

function ReviewsTab({ isCoach }: ReviewsTabProps): React.ReactElement {
    const groomReviews = (results: rest_api.CoachingGameReviewRequest[]): any[] => {
        return results.map((r) => ({
            ...r,
            href: r.review_id ? `/review/${r.review_id}` : `/game/${r.game.id}`,
        }));
    };

    const handleAcceptReview = (id: number) => {
        put(`coaching/review-requests/${id}`, { status: "reviewing" })
            .then(() => {})
            .catch(errorAlerter);
    };

    const handleDeclineReview = (id: number) => {
        alert
            .fire({
                text: _("Are you sure you want to decline this review request?"),
                showCancelButton: true,
                focusCancel: true,
            })
            .then(({ value: accept }) => {
                if (accept) {
                    put(`coaching/review-requests/${id}`, { status: "declined" })
                        .then(() => {})
                        .catch(errorAlerter);
                }
            });
    };

    return (
        <div className="reviews-tab">
            <h2>{_("Game Reviews")}</h2>

            <div className="section">
                <h3>{_("Pending Requests")}</h3>
                <PaginatedTable
                    name="pending-reviews"
                    source="coaching/review-requests"
                    filter={{ status: "pending" }}
                    groom={groomReviews}
                    columns={[
                        {
                            header: isCoach ? _("Student") : _("Coach"),
                            render: (r) => <Player user={isCoach ? r.student : r.coach} icon />,
                        },
                        {
                            header: _("Game"),
                            render: (r) => (
                                <Link to={`/game/${r.game.id}`}>
                                    {r.game.name || `Game #${r.game.id}`}
                                </Link>
                            ),
                        },
                        {
                            header: _("Note"),
                            render: (r) => r.student_note || "-",
                        },
                        {
                            header: _("Requested"),
                            render: (r) => r.created,
                        },
                        {
                            header: _("Actions"),
                            render: (r) => (
                                <div className="action-buttons">
                                    <Link to={`/game/${r.game.id}`} className="sm">
                                        {_("View Game")}
                                    </Link>
                                    {isCoach && (
                                        <>
                                            <button
                                                className="sm primary"
                                                onClick={() => handleAcceptReview(r.id)}
                                            >
                                                {_("Start Review")}
                                            </button>
                                            <button
                                                className="sm danger"
                                                onClick={() => handleDeclineReview(r.id)}
                                            >
                                                {_("Decline")}
                                            </button>
                                        </>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />
            </div>

            <div className="section">
                <h3>{_("Completed Reviews")}</h3>
                <PaginatedTable
                    name="completed-reviews"
                    source="coaching/review-requests"
                    filter={{ status: "completed" }}
                    groom={groomReviews}
                    columns={[
                        {
                            header: isCoach ? _("Student") : _("Coach"),
                            render: (r) => <Player user={isCoach ? r.student : r.coach} icon />,
                        },
                        {
                            header: _("Game"),
                            render: (r) => (
                                <Link to={`/game/${r.game.id}`}>
                                    {r.game.name || `Game #${r.game.id}`}
                                </Link>
                            ),
                        },
                        {
                            header: _("Review"),
                            render: (r) =>
                                r.review_id ? (
                                    <Link to={`/review/${r.review_id}`}>
                                        {_("View Review")}
                                    </Link>
                                ) : (
                                    "-"
                                ),
                        },
                        {
                            header: _("Completed"),
                            render: (r) => r.completed || "-",
                        },
                    ]}
                />
            </div>
        </div>
    );
}

interface AssignmentsTabProps {
    isCoach: boolean;
}

function AssignmentsTab({ isCoach }: AssignmentsTabProps): React.ReactElement {
    const [showCreate, setShowCreate] = React.useState(false);

    const groomAssignments = (results: rest_api.CoachingAssignment[]): any[] => {
        return results.map((a) => ({
            ...a,
            href: `/coaching/assignments/${a.id}`,
        }));
    };

    return (
        <div className="assignments-tab">
            <div className="tab-header">
                <h2>{_("Assignments")}</h2>
                {isCoach && (
                    <button className="primary" onClick={() => setShowCreate(true)}>
                        {_("Create Assignment")}
                    </button>
                )}
            </div>

            {showCreate && isCoach && <CreateAssignmentForm onClose={() => setShowCreate(false)} />}

            <div className="section">
                <h3>{_("Active Assignments")}</h3>
                <PaginatedTable
                    name="active-assignments"
                    source="coaching/assignments"
                    filter={{ status: ["assigned", "started"] }}
                    groom={groomAssignments}
                    columns={[
                        {
                            header: _("Title"),
                            render: (a) => (
                                <Link to={`/coaching/assignments/${a.id}`}>
                                    {a.title}
                                </Link>
                            ),
                        },
                        {
                            header: isCoach ? _("Student") : _("Coach"),
                            render: (a) => <Player user={isCoach ? a.student : a.coach} icon />,
                        },
                        {
                            header: _("Status"),
                            render: (a) => (
                                <span className={`status-${a.status}`}>
                                    {a.status === "assigned" ? _("Assigned") : _("In Progress")}
                                </span>
                            ),
                        },
                        {
                            header: _("Due Date"),
                            render: (a) => a.due_date || "-",
                        },
                    ]}
                />
            </div>

            <div className="section">
                <h3>{_("Completed Assignments")}</h3>
                <PaginatedTable
                    name="completed-assignments"
                    source="coaching/assignments"
                    filter={{ status: ["completed", "reviewed"] }}
                    groom={groomAssignments}
                    columns={[
                        {
                            header: _("Title"),
                            render: (a) => (
                                <Link to={`/coaching/assignments/${a.id}`}>
                                    {a.title}
                                </Link>
                            ),
                        },
                        {
                            header: isCoach ? _("Student") : _("Coach"),
                            render: (a) => <Player user={isCoach ? a.student : a.coach} icon />,
                        },
                        {
                            header: _("Status"),
                            render: (a) => (
                                <span className={`status-${a.status}`}>
                                    {a.status === "completed" ? _("Completed") : _("Reviewed")}
                                </span>
                            ),
                        },
                        {
                            header: _("Score"),
                            render: (a) => (
                                a.questions?.some((q) => q.score !== undefined)
                                    ? `${a.questions.filter((q) => q.score !== undefined).reduce((sum, q) => sum + (q.score || 0), 0)} / ${a.questions.length}`
                                    : "-"
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}

interface CreateAssignmentFormProps {
    onClose: () => void;
}

function CreateAssignmentForm({ onClose }: CreateAssignmentFormProps): React.ReactElement {
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [selectedStudent, setSelectedStudent] = React.useState<PlayerCacheEntry | null>(null);
    const [selectedGame, setSelectedGame] = React.useState<number | null>(null);
    const [dueDate, setDueDate] = React.useState("");
    const [questions, setQuestions] = React.useState<{ text: string; answer_type: string }[]>([
        { text: "", answer_type: "text" },
    ]);
    const [relationships, setRelationships] = React.useState<rest_api.CoachingRelationship[]>([]);

    React.useEffect(() => {
        get("coaching/relationships", { status: "active" })
            .then((res: any) => setRelationships(res.results))
            .catch(errorAlerter);
    }, []);

    const addQuestion = () => {
        setQuestions([...questions, { text: "", answer_type: "text" }]);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const updateQuestion = (index: number, field: string, value: string) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = () => {
        if (!title || !selectedStudent) {
            alert.fire({ title: _("Please fill in all required fields") });
            return;
        }

        post("coaching/assignments", {
            title,
            description,
            student_id: selectedStudent.id,
            game_id: selectedGame,
            due_date: dueDate || null,
            questions: questions.filter((q) => q.text.trim() !== ""),
        })
            .then(() => {
                alert.fire({ title: _("Assignment created!") });
                onClose();
            })
            .catch(errorAlerter);
    };

    return (
        <Card className="create-assignment-form">
            <h3>{_("Create New Assignment")}</h3>

            <div className="form-group">
                <label>{_("Title")} *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={_("Assignment title...")}
                />
            </div>

            <div className="form-group">
                <label>{_("Student")} *</label>
                <select
                    value={selectedStudent?.id || ""}
                    onChange={(e) => {
                        const id = e.target.value ? parseInt(e.target.value) : null;
                        const student = relationships.find((r) => r.student.id === id);
                        setSelectedStudent(student?.student || null);
                    }}
                >
                    <option value="">{_("Select a student...")}</option>
                    {relationships.map((r) => (
                        <option key={r.student.id} value={r.student.id}>
                            {r.student.username}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>{_("Game (optional)")}</label>
                {selectedStudent && (
                    <GameSelectorForAssignment
                        studentId={selectedStudent.id}
                        value={selectedGame}
                        onChange={setSelectedGame}
                    />
                )}
            </div>

            <div className="form-group">
                <label>{_("Description")}</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={_("Assignment description...")}
                    rows={4}
                />
            </div>

            <div className="form-group">
                <label>{_("Due Date")}</label>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>{_("Questions")}</label>
                {questions.map((q, index) => (
                    <div key={index} className="question-row">
                        <input
                            type="text"
                            value={q.text}
                            onChange={(e) => updateQuestion(index, "text", e.target.value)}
                            placeholder={interpolate(_("Question {{num}}..."), { num: index + 1 })}
                        />
                        <select
                            value={q.answer_type}
                            onChange={(e) => updateQuestion(index, "answer_type", e.target.value)}
                        >
                            <option value="text">{_("Text Answer")}</option>
                            <option value="move">{_("Move on Board")}</option>
                            <option value="variation">{_("Variation")}</option>
                            <option value="multiple_choice">{_("Multiple Choice")}</option>
                        </select>
                        {questions.length > 1 && (
                            <button
                                className="danger sm"
                                onClick={() => removeQuestion(index)}
                            >
                                <i className="fa fa-trash" />
                            </button>
                        )}
                    </div>
                ))}
                <button className="sm" onClick={addQuestion}>
                    <i className="fa fa-plus" /> {_("Add Question")}
                </button>
            </div>

            <div className="form-actions">
                <button onClick={onClose}>{_("Cancel")}</button>
                <button className="primary" onClick={handleSubmit}>
                    {_("Create Assignment")}
                </button>
            </div>
        </Card>
    );
}

interface GameSelectorForAssignmentProps {
    studentId: number;
    value: number | null;
    onChange: (id: number | null) => void;
}

function GameSelectorForAssignment({ studentId, value, onChange }: GameSelectorForAssignmentProps): React.ReactElement {
    const [games, setGames] = React.useState<rest_api.Game[]>([]);

    React.useEffect(() => {
        get(`players/${studentId}/game_history/`, { page_size: 20 })
            .then((res: any) => setGames(res.results))
            .catch(errorAlerter);
    }, [studentId]);

    return (
        <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        >
            <option value="">{_("No game selected")}</option>
            {games.map((game) => (
                <option key={game.id} value={game.id}>
                    {game.name || `Game #${game.id}`}
                </option>
            ))}
        </select>
    );
}

interface ChatTabProps {
    isCoach: boolean;
}

function ChatTab({ isCoach }: ChatTabProps): React.ReactElement {
    const [relationships, setRelationships] = React.useState<rest_api.CoachingRelationship[]>([]);
    const [selectedChat, setSelectedChat] = React.useState<number | null>(null);
    const [messages, setMessages] = React.useState<rest_api.CoachingMessage[]>([]);
    const [newMessage, setNewMessage] = React.useState("");

    React.useEffect(() => {
        get("coaching/relationships", { status: "active" })
            .then((res: any) => setRelationships(res.results))
            .catch(errorAlerter);
    }, []);

    React.useEffect(() => {
        if (selectedChat) {
            loadMessages(selectedChat);
        }
    }, [selectedChat]);

    const loadMessages = (otherUserId: number) => {
        get("coaching/messages", { other_user_id: otherUserId })
            .then((res: any) => setMessages(res.results))
            .catch(errorAlerter);
    };

    const sendMessage = () => {
        if (!selectedChat || !newMessage.trim()) return;

        post("coaching/messages", {
            to_user_id: selectedChat,
            message: newMessage,
        })
            .then(() => {
                setNewMessage("");
                loadMessages(selectedChat);
            })
            .catch(errorAlerter);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chat-tab">
            <div className="chat-layout">
                <div className="chat-list">
                    <h3>{isCoach ? _("Students") : _("Coaches")}</h3>
                    {relationships.length === 0 ? (
                        <Card>
                            <div className="empty-state">
                                {isCoach ? _("No active students yet") : _("No active coaches yet")}
                            </div>
                        </Card>
                    ) : (
                        <div className="contact-list">
                            {relationships.map((r) => {
                                const contact = isCoach ? r.student : r.coach;
                                return (
                                    <div
                                        key={contact.id}
                                        className={`contact-item ${selectedChat === contact.id ? "active" : ""}`}
                                        onClick={() => setSelectedChat(contact.id)}
                                    >
                                        <Player user={contact} icon />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="chat-window">
                    {selectedChat ? (
                        <Card className="chat-container">
                            <div className="chat-header">
                                <Player
                                    user={
                                        relationships.find(
                                            (r) =>
                                                (isCoach ? r.student.id : r.coach.id) === selectedChat,
                                        )?.[isCoach ? "student" : "coach"] || ({} as any)
                                    }
                                    icon
                                />
                            </div>

                            <div className="chat-messages">
                                {messages.map((msg) => {
                                    const user = data.get("user");
                                    const isOwn = msg.from.id === user.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`chat-message ${isOwn ? "own" : "other"}`}
                                        >
                                            <div className="message-sender">
                                                <Player user={msg.from} icon small />
                                            </div>
                                            <div className="message-content">{msg.message}</div>
                                            <div className="message-time">{msg.created}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="chat-input">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={_("Type a message...")}
                                    rows={1}
                                />
                                <button className="primary" onClick={sendMessage}>
                                    <i className="fa fa-paper-plane" />
                                </button>
                            </div>
                        </Card>
                    ) : (
                        <Card>
                            <div className="empty-state">
                                {_("Select a conversation to start chatting")}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

interface CoachesTabProps {
    onRefresh: () => void;
}

function CoachesTab({ onRefresh }: CoachesTabProps): React.ReactElement {
    const groomRelationships = (results: rest_api.CoachingRelationship[]): any[] => {
        return results.map((r) => ({
            ...r,
            href: `/player/${r.coach.id}`,
        }));
    };

    return (
        <div className="coaches-tab">
            <h2>{_("My Coaches")}</h2>

            <div className="section">
                <h3>{_("Pending Requests")}</h3>
                <PaginatedTable
                    name="pending-coaches"
                    source="coaching/relationships"
                    filter={{ status: "pending", is_student: true }}
                    groom={groomRelationships}
                    columns={[
                        {
                            header: _("Coach"),
                            render: (r) => <Player user={r.coach} icon />,
                        },
                        {
                            header: _("Status"),
                            render: (r) => <span className={`status-${r.status}`}>{r.status}</span>,
                        },
                        {
                            header: _("Message"),
                            render: (r) => r.note || "-",
                        },
                    ]}
                />
            </div>

            <div className="section">
                <h3>{_("Active Coaches")}</h3>
                <PaginatedTable
                    name="active-coaches"
                    source="coaching/relationships"
                    filter={{ status: "active", is_student: true }}
                    groom={groomRelationships}
                    columns={[
                        {
                            header: _("Coach"),
                            render: (r) => <Player user={r.coach} icon />,
                        },
                        {
                            header: _("Since"),
                            render: (r) => r.started || r.created,
                        },
                        {
                            header: _("Actions"),
                            render: (r) => (
                                <div className="action-buttons">
                                    <Link
                                        to={`/coaching/chat?coach=${r.coach.id}`}
                                        className="sm"
                                    >
                                        {_("Chat")}
                                    </Link>
                                    <Link to={`/player/${r.coach.id}`} className="sm">
                                        {_("View Profile")}
                                    </Link>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}
