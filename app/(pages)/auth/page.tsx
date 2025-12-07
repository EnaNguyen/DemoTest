"use client"; 

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hotel } from "lucide-react";
import LoginForm from "@/components/forms/auth/LoginForm";
import RegisterForm from "@/components/forms/auth/RegisterForm";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin((prev) => !prev);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[680px]">
          <div className="lg:w-[45%] xl:w-2/5 bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-10 lg:p-12 xl:p-16 flex flex-col justify-center items-center text-center">
            <div className="max-w-sm mx-auto space-y-8">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto">
                <Hotel className="h-12 w-12" />
              </div>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={isLogin ? "welcome" : "join"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl lg:text-5xl font-bold"
                >
                  {isLogin ? "Chào mừng quay lại!" : "Tạo tài khoản mới"}
                </motion.h1>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p
                  key={isLogin ? "desc1" : "desc2"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="text-blue-100 text-lg leading-relaxed"
                >
                  {isLogin
                    ? "Đăng nhập để tiếp tục quản lý đặt phòng của bạn"
                    : "Tham gia HotelHub – nơi tìm trọ nhanh chóng và tin cậy"}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex-1 bg-white p-8 lg:p-10 xl:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <LoginForm onToggle={toggleMode} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <RegisterForm onToggle={toggleMode} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}