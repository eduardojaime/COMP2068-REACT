"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";

// Define the structure of the form data using a TypeScript interface.
interface RegisterFormData {
  username: string;
  password: string;
  confirm: string;
}

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  const [messageClass, setMessageClass] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const password = watch("password"); // Watch the password field to validate confirm password

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    // VALIDATIONS
    if (data.password !== data.confirm) {
      setMessage("Passwords do not match");
      setMessageClass("alert alert-danger");
      return;
    }
    // Try registering the user by sending a POST request to the backend API
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });
      // If something goes wrong with the registration throw an error
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      // Rest of the code assumes registration was successful, set the success message and class
      const result = await res.json();
      if (result.username) {
        setMessage("Registration successful! Please login.");
        setMessageClass("alert alert-success");
      }

    } catch (error) {
      setMessage("Registration failed.");
      setMessageClass("alert alert-danger");
    }
  }

  // Registration Page HTML:
  return (
    <div className="container mt-4">
      <h1>Register</h1>
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
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' }
            })}
          />
          {errors.password && <span className="text-danger">{errors.password.message}</span>}
        </div>

        <div className="mb-3">
          <label htmlFor="confirm" className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="confirm"
            {...register('confirm', { required: 'Please confirm password' })}
          />
          {errors.confirm && <span className="text-danger">{errors.confirm.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary">Register</button>
      </form>

      {messageClass === 'alert alert-success' && (
        <Link href="/auth/login" className="btn btn-primary mt-3">
          Login
        </Link>
      )}
    </div>
  );
}


