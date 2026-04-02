"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

interface LoginFormData {
  username: string;
  password: string;
}
export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [messageClass, setMessageClass] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      await login(data.username, data.password);
      router.push("/sushi");
    } catch (error) {
      setMessage("Login failed. Please check your credentials.");
      setMessageClass("alert alert-danger");
    }
  }

  // Login Page HTML
  return (
    <div className="container mt-4">
      <h1>Login</h1>
      <h5 className={messageClass}>{message}</h5>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            {...register('username', { required: 'Username is required' })}
          />
          {errors.username && <span className="text-danger">{errors.username.message}</span>}
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <span className="text-danger">{errors.password.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );

}