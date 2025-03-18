import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom"

const Home = () => {
  return (
    <>
      <Navbar />

      <main className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-indigo-600 mb-4">Focus Flow</h1>
          <p className="text-lg text-gray-600 mb-6">
            Stay focused and organized by managing your tasks efficiently. Focus Flow helps you keep track of your to-do list and prioritize what matters most.
          </p>
          <Link to="/register">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-md text-lg hover:bg-indigo-700 transition">
                Get Started
            </button>
          </Link>
        </div>
      </main>
    </>
  )
};

export default Home;