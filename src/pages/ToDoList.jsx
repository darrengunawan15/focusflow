import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import NavbarIn from "../components/NavbarIn";
import dayjs from "dayjs";

export default function TodoList() {
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState(dayjs().format("YYYY-MM-DDTHH:mm")); // Default to now
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userTasksRef = collection(db, "tasks", user.uid, "userTasks");

    const unsubscribe = onSnapshot(userTasksRef, (snapshot) => {
      let tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sorting: nearest deadline first, then by submission time
      tasksData.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return dayjs(a.dueDate).isBefore(dayjs(b.dueDate)) ? -1 : 1;
        } else {
          return a.createdAt?.seconds - b.createdAt?.seconds;
        }
      });

      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [user]);

  // Recalculate countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns = {};
      tasks.forEach((t) => {
        if (t.dueDate) {
          const timeLeft = calculateTimeLeft(t.dueDate);
          newCountdowns[t.id] = timeLeft;
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  const addTask = async (e) => {
    e.preventDefault();
    if (task.trim() === "" || !user || dueDate.trim() === "") return;
    const userTasksRef = collection(db, "tasks", user.uid, "userTasks");
    await addDoc(userTasksRef, {
      text: task,
      dueDate,
      createdAt: serverTimestamp(),
    });
    // Clear input boxes
    setTask("");
    setDueDate(dayjs().format("YYYY-MM-DDTHH:mm")); // Reset date to current
  };

  const deleteTask = async (id) => {
    if (!user) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;
    const taskRef = doc(db, "tasks", user.uid, "userTasks", id);
    await deleteDoc(taskRef);
  };

  const editTask = async (id, newText, newDueDate) => {
    if (!user) return;
    const taskRef = doc(db, "tasks", user.uid, "userTasks", id);
    await updateDoc(taskRef, { text: newText, dueDate: newDueDate });
  };

  const calculateTimeLeft = (dueDate) => {
    const now = dayjs();
    const due = dayjs(dueDate);
    if (due.isBefore(now)) return "⏰ Past due!";

    const diffMs = due.diff(now);
    const diffSeconds = Math.floor(diffMs / 1000) % 60;
    const diffMinutes = Math.floor(diffMs / (1000 * 60)) % 60;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return `${diffDays > 0 ? diffDays + "d " : ""}${diffHours
      .toString()
      .padStart(2, "0")}h ${diffMinutes.toString().padStart(2, "0")}m ${diffSeconds
        .toString()
        .padStart(2, "0")}s`;
  };

  const finishTask = async (id) => {
    if (!user) return;
    const taskRef = doc(db, "tasks", user.uid, "userTasks", id);
    await updateDoc(taskRef, { completed: true });
  };

  return (
    <>
      <NavbarIn />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full h-[600px] flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-center">My To-Do List</h2>

          <form onSubmit={addTask} className="flex flex-col gap-2 mb-4">
            <input
              type="text"
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter a task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
            />
            <input
              type="datetime-local"
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Add
            </button>
          </form>

          <ul className="space-y-2 overflow-y-auto flex-grow">
            {tasks.map((t) => (
              <li
                key={t.id}
                className={`flex flex-col bg-gray-100 p-3 rounded-lg ${t.completed ? "opacity-70" : ""
                  }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <input
                    className={`flex-grow mr-2 bg-transparent focus:outline-none ${t.completed ? "line-through" : ""
                      }`}
                    value={t.text}
                    disabled={t.completed} // Disable editing if completed
                    onChange={(e) => editTask(t.id, e.target.value, t.dueDate)}
                  />
                  <div className="flex gap-2">
                    {!t.completed && (
                      <button
                        onClick={() => finishTask(t.id)}
                        className="text-green-500 hover:text-green-700"
                      >
                        Finish
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <input
                  type="datetime-local"
                  value={t.dueDate}
                  onChange={(e) => editTask(t.id, t.text, e.target.value)}
                  className="mb-2 p-1 border rounded"
                  required
                  disabled={t.completed} // Disable date edit if completed
                />
                <p className="text-sm text-gray-500">
                  {t.completed ? "✅ Finished!" : countdowns[t.id]}
                </p>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </>
  );
}