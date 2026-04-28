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
import { Link } from "react-router-dom";
import { _, interpolate } from "@/lib/translate";
import { get, post, put } from "@/lib/requests";
import * as data from "@/lib/data";
import { Card } from "@/components/material";
import { Player } from "@/components/Player";
import { PlayerAutocomplete } from "@/components/PlayerAutocomplete";
import { PlayerCacheEntry } from "@/lib/player_cache";
import { errorAlerter } from "@/lib/misc";
import { alert } from "@/lib/swal_config";
import "./CoachingCenter.css";

type TabType = "overview" | "students" | "games" | "reviews" | "assignments" | "chat" | "coaches";
type UserRole = "coach" | "student" | "both";

export function CoachingCenter(): React.ReactElement {
    const user = data.get("user");

    const [activeTab, setActiveTab] = React.useState<TabType>("overview");
    const [userRole, setUserRole] = React.useState<UserRole>("both");
    const [loading, setLoading] = React.useState(false);
    const [apiAvailable, setApiAvailable] = React.useState(true);

    React.useEffect(() => {
        checkApiAvailability();
    }, []);

    const checkApiAvailability = async () => {
        try {
            setLoading(true);
            const testResult = await get("coaching/stats/coach");
            console.log("API test result:", testResult);
            setApiAvailable(true);
        } catch (err) {
            console.warn("Coaching API not available, running in demo mode:", err);
            setApiAvailable(false);
        } finally {
            setLoading(false);
        }
    };

    const isCoach = userRole === "coach" || userRole === "both";
    const isStudent = userRole === "student" || userRole === "both";

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
            {!apiAvailable && (
                <Card className="demo-warning">
                    <div className="warning-content">
                        <i className="fa fa-info-circle" />
                        <span>
                            {_("Running in demo mode - Coaching API is not available")}
                        </span>
                    </div>
                    <div className="role-selector">
                        <span>{_("View as:")}</span>
                        <button
                            className={userRole === "coach" ? "active" : ""}
                            onClick={() => setUserRole("coach")}
                        >
                            {_("Coach")}
                        </button>
                        <button
                            className={userRole === "student" ? "active" : ""}
                            onClick={() => setUserRole("student")}
                        >
                            {_("Student")}
                        </button>
                        <button
                            className={userRole === "both" ? "active" : ""}
                            onClick={() => setUserRole("both")}
                        >
                            {_("Both")}
                        </button>
                    </div>
                </Card>
            )}

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
                {isStudent && (
                    <button
                        className={activeTab === "coaches" ? "active" : ""}
                        onClick={() => setActiveTab("coaches")}
                    >
                        {_("My Coaches")}
                    </button>
                )}
            </div>

            <div className="tab-content">
                {activeTab === "overview" && (
                    <OverviewTab isCoach={isCoach} isStudent={isStudent} apiAvailable={apiAvailable} />
                )}
                {activeTab === "students" && isCoach && (
                    <StudentsTab apiAvailable={apiAvailable} />
                )}
                {activeTab === "games" && isCoach && (
                    <StudentGamesTab apiAvailable={apiAvailable} />
                )}
                {activeTab === "reviews" && (
                    <ReviewsTab isCoach={isCoach} apiAvailable={apiAvailable} />
                )}
                {activeTab === "assignments" && (
                    <AssignmentsTab isCoach={isCoach} apiAvailable={apiAvailable} />
                )}
                {activeTab === "chat" && (
                    <ChatTab isCoach={isCoach} apiAvailable={apiAvailable} />
                )}
                {activeTab === "coaches" && isStudent && (
                    <CoachesTab apiAvailable={apiAvailable} />
                )}
            </div>
        </div>
    );
}

interface OverviewTabProps {
    isCoach: boolean;
    isStudent: boolean;
    apiAvailable: boolean;
}

function OverviewTab({ isCoach, isStudent, apiAvailable }: OverviewTabProps): React.ReactElement {
    return (
        <div className="overview">
            <div className="stats-grid">
                {isCoach && (
                    <>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">{apiAvailable ? "0" : "-"}</div>
                                <div className="stat-label">{_("Active Students")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">{apiAvailable ? "0" : "-"}</div>
                                <div className="stat-label">{_("Pending Requests")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">{apiAvailable ? "0" : "-"}</div>
                                <div className="stat-label">{_("Pending Reviews")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">{apiAvailable ? "0" : "-"}</div>
                                <div className="stat-label">{_("Assignments")}</div>
                            </div>
                        </Card>
                    </>
                )}
                {isStudent && (
                    <>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">{apiAvailable ? "0" : "-"}</div>
                                <div className="stat-label">{_("Active Coaches")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">{apiAvailable ? "0" : "-"}</div>
                                <div className="stat-label">{_("Pending Requests")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">{apiAvailable ? "0" : "-"}</div>
                                <div className="stat-label">{_("Review Requests")}</div>
                            </div>
                        </Card>
                        <Card>
                            <div className="stat-item">
                                <div className="stat-value">{apiAvailable ? "0" : "-"}</div>
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
                        <Link to="/players" className="primary">
                            {_("Invite New Student")}
                        </Link>
                        <button className="primary" disabled={!apiAvailable}>
                            {_("Create Assignment")}
                        </button>
                    </div>
                ) : (
                    <div className="action-buttons">
                        <Link to="/players" className="primary">
                            {_("Find a Coach")}
                        </Link>
                        <RequestReviewButton apiAvailable={apiAvailable} />
                    </div>
                )}
            </div>
        </div>
    );
}

interface RequestReviewButtonProps {
    apiAvailable: boolean;
}

function RequestReviewButton({ apiAvailable }: RequestReviewButtonProps): React.ReactElement {
    const [showModal, setShowModal] = React.useState(false);
    const [selectedGame, setSelectedGame] = React.useState<number | null>(null);
    const [note, setNote] = React.useState("");

    const handleSubmit = () => {
        if (!apiAvailable) {
            alert.fire({ title: _("API not available in demo mode") });
            return;
        }
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
            <button
                className="primary"
                onClick={() => setShowModal(true)}
                disabled={!apiAvailable}
            >
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
                                apiAvailable={apiAvailable}
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
    apiAvailable: boolean;
}

function GameSelector({ value, onChange, apiAvailable }: GameSelectorProps): React.ReactElement {
    const [games, setGames] = React.useState<rest_api.Game[]>([]);
    const user = data.get("user");

    React.useEffect(() => {
        if (apiAvailable && user && user.id) {
            get(`players/${user.id}/game_history/`, { page_size: 20 })
                .then((res: any) => setGames(res.results || []))
                .catch(errorAlerter);
        }
    }, [apiAvailable, user]);

    return (
        <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
            disabled={!apiAvailable}
        >
            <option value="">{_("Select a game...")}</option>
            {games.map((game) => (
                <option key={game.id} value={game.id}>
                    {game.name || `Game #${game.id}`}
                </option>
            ))}
        </select>
    );
}

interface StudentsTabProps {
    apiAvailable: boolean;
}

function StudentsTab({ apiAvailable }: StudentsTabProps): React.ReactElement {
    const [showInvite, setShowInvite] = React.useState(false);
    const [selectedStudent, setSelectedStudent] = React.useState<PlayerCacheEntry | null>(null);
    const [inviteNote, setInviteNote] = React.useState("");

    const handleInvite = () => {
        if (!apiAvailable) {
            alert.fire({ title: _("API not available in demo mode") });
            return;
        }
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
            })
            .catch(errorAlerter);
    };

    return (
        <div className="students-tab">
            <div className="tab-header">
                <h2>{_("My Students")}</h2>
                <button
                    className="primary"
                    onClick={() => setShowInvite(true)}
                    disabled={!apiAvailable}
                >
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

            {!apiAvailable && (
                <Card>
                    <div className="empty-state">
                        {_("Student list requires Coaching API")}
                    </div>
                </Card>
            )}

            {apiAvailable && (
                <>
                    <div className="section">
                        <h3>{_("Pending Invitations")}</h3>
                        <Card>
                            <div className="empty-state">
                                {_("No pending invitations")}
                            </div>
                        </Card>
                    </div>

                    <div className="section">
                        <h3>{_("Active Students")}</h3>
                        <Card>
                            <div className="empty-state">
                                {_("No active students yet. Invite players to get started!")}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

interface StudentGamesTabProps {
    apiAvailable: boolean;
}

function StudentGamesTab({ apiAvailable }: StudentGamesTabProps): React.ReactElement {
    const [selectedStudent, setSelectedStudent] = React.useState<number | null>(null);

    return (
        <div className="student-games-tab">
            <div className="tab-header">
                <h2>{_("Student Games")}</h2>
                <select
                    value={selectedStudent || ""}
                    onChange={(e) =>
                        setSelectedStudent(e.target.value ? parseInt(e.target.value) : null)
                    }
                    disabled={!apiAvailable}
                >
                    <option value="">{_("All Students")}</option>
                </select>
            </div>

            <Card>
                <div className="empty-state">
                    {apiAvailable
                        ? _("No student games found. This will show games from your active students.")
                        : _("Student games list requires Coaching API")}
                </div>
            </Card>
        </div>
    );
}

interface ReviewsTabProps {
    isCoach: boolean;
    apiAvailable: boolean;
}

function ReviewsTab({ isCoach, apiAvailable }: ReviewsTabProps): React.ReactElement {
    return (
        <div className="reviews-tab">
            <h2>{_("Game Reviews")}</h2>

            <div className="section">
                <h3>{_("Pending Requests")}</h3>
                <Card>
                    <div className="empty-state">
                        {apiAvailable
                            ? _("No pending review requests")
                            : _("Review requests require Coaching API")}
                    </div>
                </Card>
            </div>

            <div className="section">
                <h3>{_("Completed Reviews")}</h3>
                <Card>
                    <div className="empty-state">
                        {apiAvailable
                            ? _("No completed reviews yet")
                            : _("Completed reviews require Coaching API")}
                    </div>
                </Card>
            </div>
        </div>
    );
}

interface AssignmentsTabProps {
    isCoach: boolean;
    apiAvailable: boolean;
}

function AssignmentsTab({ isCoach, apiAvailable }: AssignmentsTabProps): React.ReactElement {
    const [showCreate, setShowCreate] = React.useState(false);

    return (
        <div className="assignments-tab">
            <div className="tab-header">
                <h2>{_("Assignments")}</h2>
                {isCoach && (
                    <button
                        className="primary"
                        onClick={() => setShowCreate(true)}
                        disabled={!apiAvailable}
                    >
                        {_("Create Assignment")}
                    </button>
                )}
            </div>

            {showCreate && isCoach && apiAvailable && (
                <CreateAssignmentForm onClose={() => setShowCreate(false)} />
            )}

            <div className="section">
                <h3>{_("Active Assignments")}</h3>
                <Card>
                    <div className="empty-state">
                        {apiAvailable
                            ? _("No active assignments")
                            : _("Assignments require Coaching API")}
                    </div>
                </Card>
            </div>

            <div className="section">
                <h3>{_("Completed Assignments")}</h3>
                <Card>
                    <div className="empty-state">
                        {apiAvailable
                            ? _("No completed assignments yet")
                            : _("Completed assignments require Coaching API")}
                    </div>
                </Card>
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
        if (!title) {
            alert.fire({ title: _("Please fill in the title") });
            return;
        }
        post("coaching/assignments", {
            title,
            description,
            student_id: selectedStudent?.id,
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
                <label>{_("Student (optional - leave blank for all students)")}</label>
                <PlayerAutocomplete onComplete={setSelectedStudent} />
                {selectedStudent && (
                    <div className="selected-player">
                        <Player user={selectedStudent} icon />
                    </div>
                )}
            </div>

            <div className="form-group">
                <label>{_("Game (optional)")}</label>
                {selectedStudent && (
                    <GameSelector
                        value={selectedGame}
                        onChange={setSelectedGame}
                        apiAvailable={true}
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

interface ChatTabProps {
    isCoach: boolean;
    apiAvailable: boolean;
}

function ChatTab({ isCoach, apiAvailable }: ChatTabProps): React.ReactElement {
    const [selectedChat, setSelectedChat] = React.useState<number | null>(null);
    const [messages, setMessages] = React.useState<rest_api.CoachingMessage[]>([]);
    const [newMessage, setNewMessage] = React.useState("");

    const sendMessage = () => {
        if (!apiAvailable) {
            alert.fire({ title: _("API not available in demo mode") });
            return;
        }
        if (!selectedChat || !newMessage.trim()) return;

        post("coaching/messages", {
            to_user_id: selectedChat,
            message: newMessage,
        })
            .then(() => {
                setNewMessage("");
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
                    <Card>
                        <div className="empty-state">
                            {apiAvailable
                                ? _(isCoach ? "No active students yet" : "No active coaches yet")
                                : _("Chat requires Coaching API")}
                        </div>
                    </Card>
                </div>

                <div className="chat-window">
                    <Card className="chat-container">
                        <div className="chat-header">
                            <span>{_("Select a conversation to start chatting")}</span>
                        </div>

                        <div className="chat-messages">
                            <div className="empty-state">
                                {_("Messages will appear here")}
                            </div>
                        </div>

                        <div className="chat-input">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={_("Type a message...")}
                                rows={1}
                                disabled={!apiAvailable || !selectedChat}
                            />
                            <button
                                className="primary"
                                onClick={sendMessage}
                                disabled={!apiAvailable || !selectedChat}
                            >
                                <i className="fa fa-paper-plane" />
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

interface CoachesTabProps {
    apiAvailable: boolean;
}

function CoachesTab({ apiAvailable }: CoachesTabProps): React.ReactElement {
    return (
        <div className="coaches-tab">
            <h2>{_("My Coaches")}</h2>

            <div className="section">
                <h3>{_("Pending Requests")}</h3>
                <Card>
                    <div className="empty-state">
                        {apiAvailable
                            ? _("No pending coach requests")
                            : _("Coach requests require Coaching API")}
                    </div>
                </Card>
            </div>

            <div className="section">
                <h3>{_("Active Coaches")}</h3>
                <Card>
                    <div className="empty-state">
                        {apiAvailable
                            ? _("No active coaches yet")
                            : _("Active coaches require Coaching API")}
                    </div>
                </Card>
            </div>
        </div>
    );
}
