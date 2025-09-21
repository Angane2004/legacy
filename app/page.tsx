// app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [transformedData, setTransformedData] = useState(null);
  const [outputFormat, setOutputFormat] = useState("JSON");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Handle sign up
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date(),
      });
      showNotification("Account created successfully!", "success");
      setShowSignup(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showNotification("Login successful!", "success");
      setShowLogin(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification("Logged out successfully!", "success");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      showNotification("File uploaded successfully!", "success");
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      showNotification("File uploaded successfully!", "success");
    }
  };

  // Process file
  const processFile = () => {
    if (!uploadedFile) {
      showNotification("Please upload a file first", "error");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing with a timeout
    setTimeout(() => {
      // Mock transformed data
      const mockData = {
        originalFormat: "AS/400 Flat File",
        transformedFormat: outputFormat,
        data: {
          customers: [
            { id: "CUST001", name: "Acme Corporation", contact: "John Doe", email: "john@acme.com" },
            { id: "CUST002", name: "Global Industries", contact: "Jane Smith", email: "jane@global.com" },
            { id: "CUST003", name: "Tech Solutions Ltd", contact: "Robert Johnson", email: "robert@tech.com" },
          ],
          orders: [
            { id: "ORD001", customerId: "CUST001", date: "2023-05-15", amount: 1250.75, status: "Completed" },
            { id: "ORD002", customerId: "CUST002", date: "2023-05-16", amount: 875.50, status: "Processing" },
            { id: "ORD003", customerId: "CUST003", date: "2023-05-17", amount: 2100.00, status: "Pending" },
          ],
        },
        apiEndpoints: [
          { method: "GET", path: "/api/customers", description: "Retrieve all customers" },
          { method: "GET", path: "/api/customers/:id", description: "Retrieve a specific customer" },
          { method: "POST", path: "/api/customers", description: "Create a new customer" },
          { method: "GET", path: "/api/orders", description: "Retrieve all orders" },
          { method: "GET", path: "/api/orders/:id", description: "Retrieve a specific order" },
        ],
        microservices: [
          {
            name: "Customer Service",
            description: "Manages customer data and operations",
            codeSnippet: `// Customer Microservice\nconst express = require('express');\nconst app = express();\n\napp.get('/customers', (req, res) => {\n  // Retrieve customers from transformed data\n  res.json(customers);\n});\n\napp.listen(3000, () => {\n  console.log('Customer Service running on port 3000');\n});`,
          },
          {
            name: "Order Service",
            description: "Handles order processing and tracking",
            codeSnippet: `// Order Microservice\nconst express = require('express');\nconst app = express();\n\napp.get('/orders', (req, res) => {\n  // Retrieve orders from transformed data\n  res.json(orders);\n});\n\napp.listen(3001, () => {\n  console.log('Order Service running on port 3001');\n});`,
          },
        ],
      };
      
      setTransformedData(mockData);
      setIsProcessing(false);
      setActiveTab("preview");
      showNotification("File transformed successfully!", "success");
    }, 2000);
  };

  // Download transformed data
  const downloadData = () => {
    if (!transformedData) return;
    
    const dataStr = JSON.stringify(transformedData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `transformed_data.${outputFormat.toLowerCase()}`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    showNotification("Data downloaded successfully!", "success");
  };

  // Copy code snippet
  const copyCodeSnippet = (code) => {
    navigator.clipboard.writeText(code);
    showNotification("Code copied to clipboard!", "success");
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg font-medium">Loading LegacyAI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center ${
              notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            <div className="mr-3">
              {notification.type === "success" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-40 ${darkMode ? "bg-gray-800/90 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm"} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold"
                >
                  AI
                </motion.div>
                <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                  LegacyAI
                </span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  href="#" 
                  className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Home
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  href="#" 
                  className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Features
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  href="#" 
                  className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Solutions
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  href="#" 
                  className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Pricing
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  href="#" 
                  className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  About
                </motion.a>
              </div>
            </div>
            <div className="flex items-center">
              {/* <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none"
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </motion.button> */}
              {user ? (
                <div className="ml-4 flex items-center md:ml-6">
                  <div className="ml-3 relative">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="ml-2 text-sm font-medium hidden md:block">{user.email}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="ml-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-md"
                      >
                        Logout
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ml-4 flex items-center md:ml-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSignup(true)}
                    className="ml-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 shadow-md"
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {!user ? (
          // Landing Page
          <div className="relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900"></div>
              <div className="absolute top-0 left-0 w-full h-full opacity-30">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-900 filter blur-3xl"></div>
                <div className="absolute top-3/4 left-3/4 w-64 h-64 rounded-full bg-purple-300 dark:bg-purple-900 filter blur-3xl"></div>
              </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4"
                  >
                    AI-Powered Legacy Modernization
                  </motion.span>
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight"
                  >
                    <span className="block">Transform Your</span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mt-2">
                      Legacy Systems
                    </span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl"
                  >
                    Unlock valuable data trapped in your AS/400 systems with our AI-powered modernization assistant. Transform flat files and DB2 databases into modern APIs and JSON structures in minutes, not months.
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-10 flex flex-col sm:flex-row gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowSignup(true)}
                      className="px-8 py-3 rounded-full text-base font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-200"
                    >
                      Get Started
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowLogin(true)}
                      className="px-8 py-3 rounded-full text-base font-medium bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700 shadow-md hover:shadow-lg transform transition-all duration-200"
                    >
                      Sign In
                    </motion.button>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-12 flex items-center space-x-8"
                  >
                    <div className="flex -space-x-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold border-2 border-white dark:border-gray-900">
                        JD
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-white dark:border-gray-900">
                        AS
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-bold border-2 border-white dark:border-gray-900">
                        MJ
                      </div>
                    </div>
                    <div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Trusted by enterprises worldwide
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="relative"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800">
                    <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Legacy to Modern Transformation</h3>
                        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                          Visualize how your AS/400 data transforms into modern JSON structures and APIs
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-yellow-400 opacity-20 blur-xl"></div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-blue-400 opacity-20 blur-xl"></div>
                </motion.div>
              </div>
            </div>

            {/* Features Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Modernization</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Our AI-powered assistant provides everything you need to transform your legacy systems into modern, efficient architectures.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    ),
                    title: "Ingest Legacy Data",
                    description: "Easily upload flat files, DB2 tables, and other legacy formats from your AS/400 systems.",
                    color: "from-blue-500 to-indigo-500"
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    ),
                    title: "AI-Powered Transformation",
                    description: "Our AI automatically translates outdated data structures into modern JSON formats and APIs.",
                    color: "from-purple-500 to-pink-500"
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ),
                    title: "Secure & Local Processing",
                    description: "Process sensitive data offline with Ollama integration, ensuring complete data privacy.",
                    color: "from-green-500 to-teal-500"
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    ),
                    title: "Generate Microservices",
                    description: "Automatically generate code snippets to help you start building new applications immediately.",
                    color: "from-yellow-500 to-orange-500"
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                    title: "Lightning Fast",
                    description: "Transform complex legacy structures in seconds, not hours. Our optimized AI models deliver results quickly.",
                    color: "from-red-500 to-pink-500"
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    ),
                    title: "Comprehensive Support",
                    description: "Works with all major AS/400 data formats including flat files, DB2 databases, and green-screen exports.",
                    color: "from-indigo-500 to-blue-500"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className={`p-8 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} text-white mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Testimonials Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  See what our customers have to say about transforming their legacy systems with LegacyAI.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Sarah Johnson",
                    role: "CTO at Financial Solutions Inc.",
                    content: "LegacyAI transformed our 30-year-old AS/400 system into modern APIs in just two weeks. What would have taken months of manual work was completed effortlessly.",
                    avatar: "SJ"
                  },
                  {
                    name: "Michael Chen",
                    role: "IT Director at Global Healthcare",
                    content: "The AI-powered transformation is incredibly accurate. We've modernized our patient records system without any data loss or corruption.",
                    avatar: "MC"
                  },
                  {
                    name: "Emily Rodriguez",
                    role: "Lead Architect at TechCorp",
                    content: "The microservices generation feature is a game-changer. We went from legacy data to running modern services in production in record time.",
                    avatar: "ER"
                  }
                ].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`p-8 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-xl border border-gray-200 dark:border-gray-700`}
                  >
                    <div className="flex items-center mb-6">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`rounded-3xl overflow-hidden shadow-2xl ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-900" : "bg-gradient-to-r from-blue-600 to-indigo-700"}`}
              >
                <div className="px-8 py-12 md:px-12 md:py-16">
                  <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Modernize Your Legacy Systems?</h2>
                    <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-8">
                      Join thousands of enterprises who have transformed their AS/400 systems with our AI-powered assistant.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowSignup(true)}
                      className="px-8 py-3 rounded-full text-lg font-medium bg-white text-blue-600 shadow-lg hover:shadow-xl transform transition-all duration-200"
                    >
                      Get Started Free
                    </motion.button>
                    <p className="mt-4 text-sm text-blue-200">
                      No credit card required • 14-day free trial
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          // Dashboard
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Legacy Modernization Dashboard</h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Transform your AS/400 data into modern formats and APIs
              </p>
            </div>

            <div className={`rounded-2xl shadow-xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("upload")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "upload"
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    disabled={!transformedData}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "preview"
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    } ${!transformedData ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab("export")}
                    disabled={!transformedData}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "export"
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    } ${!transformedData ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Export
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "upload" && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Upload Your Legacy Data</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Drag and drop your files or click to browse. We support flat files, DB2 databases, and more.
                    </p>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </motion.div>
                      <p className="text-lg font-medium mb-2">Upload your legacy data</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-blue-500">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Flat files, DB2 databases up to 10MB
                      </p>
                    </motion.div>

                    {uploadedFile && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-xl"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              File uploaded successfully
                            </h3>
                            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                              <p>{uploadedFile.name}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="w-full md:w-auto">
                        <label htmlFor="output-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Output Format
                        </label>
                        <select
                          id="output-format"
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value)}
                          className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option>JSON</option>
                          <option>XML</option>
                          <option>CSV</option>
                        </select>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={processFile}
                        disabled={!uploadedFile || isProcessing}
                        className={`w-full md:w-auto px-6 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg ${
                          !uploadedFile || isProcessing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isProcessing ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Transform Data"
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}

                {activeTab === "preview" && transformedData && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Transformed Data Preview</h2>
                    
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-3">Data Structure</h3>
                      <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-100"} overflow-x-auto`}>
                        <pre className="text-sm">{JSON.stringify(transformedData.data, null, 2)}</pre>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-3">API Endpoints</h3>
                      <div className={`rounded-xl overflow-hidden shadow ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                          <thead className={`${darkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Method
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Path
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y divide-gray-200 dark:divide-gray-600 ${darkMode ? "bg-gray-700" : "bg-white"}`}>
                            {transformedData.apiEndpoints.map((endpoint, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    endpoint.method === "GET" ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : 
                                    endpoint.method === "POST" ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100" :
                                    endpoint.method === "PUT" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100" :
                                    "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                  }`}>
                                    {endpoint.method}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                  {endpoint.path}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  {endpoint.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Microservices</h3>
                      <div className="space-y-6">
                        {transformedData.microservices.map((service, index) => (
                          <div key={index} className={`p-6 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-100"} shadow`}>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-lg">{service.name}</h4>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">{service.description}</p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => copyCodeSnippet(service.codeSnippet)}
                                className="px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow"
                              >
                                Copy Code
                              </motion.button>
                            </div>
                            <div className={`p-4 rounded-lg text-sm font-mono overflow-x-auto ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}>
                              <pre>{service.codeSnippet}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "export" && transformedData && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Export Transformed Data</h2>
                    
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-3">Data Format</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {["JSON", "XML", "CSV"].map((format) => (
                          <motion.div
                            key={format}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-5 rounded-xl border-2 cursor-pointer ${
                              outputFormat === format 
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md" 
                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                            onClick={() => setOutputFormat(format)}
                          >
                            <div className="font-medium text-lg">{format}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {format === "JSON" ? "JavaScript Object Notation" : 
                               format === "XML" ? "eXtensible Markup Language" :
                               "Comma-Separated Values"}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-3">Export Options</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            id="include-api"
                            type="checkbox"
                            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                            defaultChecked
                          />
                          <label htmlFor="include-api" className="ml-2 block text-sm">
                            Include API endpoints documentation
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="include-microservices"
                            type="checkbox"
                            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                            defaultChecked
                          />
                          <label htmlFor="include-microservices" className="ml-2 block text-sm">
                            Include microservices code snippets
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={downloadData}
                        className="px-6 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg"
                      >
                        Download {outputFormat} File
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className={`rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-6 ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-900" : "bg-gradient-to-r from-blue-50 to-indigo-50"}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Welcome Back</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowLogin(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Sign in to your account to continue</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
                  >
                    Sign In
                  </motion.button>
                </form>
                <div className="mt-6 text-center text-sm">
                  Don't have an account?{" "}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setShowLogin(false);
                      setShowSignup(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Sign up
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signup Modal */}
      <AnimatePresence>
        {showSignup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSignup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className={`rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-6 ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-900" : "bg-gradient-to-r from-green-50 to-teal-50"}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Create Account</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSignup(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Join us to start modernizing your legacy systems</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleSignup}>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg"
                  >
                    Create Account
                  </motion.button>
                </form>
                <div className="mt-6 text-center text-sm">
                  Already have an account?{" "}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setShowSignup(false);
                      setShowLogin(true);
                    }}
                    className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                  >
                    Login
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={`mt-16 ${darkMode ? "bg-gray-800" : "bg-gray-900"} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <span className="ml-2 text-xl font-bold">LegacyAI</span>
              </div>
              <p className="mt-4 text-gray-300 max-w-md">
                Transform your legacy AS/400 systems into modern architectures with our AI-powered modernization assistant.
              </p>
              <div className="mt-6 flex space-x-4">
                {["twitter", "github", "linkedin", "facebook"].map((social) => (
                  <motion.a
                    key={social}
                    whileHover={{ scale: 1.1, y: -3 }}
                    href="#"
                    className="text-gray-400 hover:text-white"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <div className="h-4 w-4 bg-gray-400 rounded"></div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Product</h3>
              <ul className="mt-4 space-y-2">
                {["Features", "Solutions", "Pricing", "Tutorials"].map((item) => (
                  <li key={item}>
                    <motion.a
                      whileHover={{ x: 5 }}
                      href="#" className="text-gray-300 hover:text-white"
                    >
                      {item}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <motion.a
                      whileHover={{ x: 5 }}
                      href="#" className="text-gray-300 hover:text-white"
                    >
                      {item}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} LegacyAI. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <motion.a
                  key={item}
                  whileHover={{ y: -2 }}
                  href="#" className="text-sm text-gray-400 hover:text-white"
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}