import React, { useState, useEffect } from "react";
import Input from "../../components/input";
import Button from "../../components/Button";
import loginImage from "../../assets/login.jpg";
import registerImage from "../../assets/register.jpg";
import { useNavigate } from "react-router-dom";

const Form = ({ isSignInPage = false }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    ...(isSignInPage
      ? {}
      : {
          username: "",
          dateOfBirth: "",
          phone: "",
          address: "",
          country: "",
          city: "",
          district: "",
        }),
    email: "",
    password: "",
  });

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/countries");
        if (!res.ok) throw new Error("Failed to fetch countries");
        const data = await res.json();
        setCountries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const handleCityChange = async (country) => {
    setData((prevData) => ({ ...prevData, country, city: "", district: "" }));
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/cities?country=${country}`
      );
      if (!res.ok) throw new Error("Failed to fetch cities");
      const data = await res.json();
      setCities(data);
      setDistricts([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictChange = async (city) => {
    setData((prevData) => ({ ...prevData, city, district: "" }));
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/districts?city=${city}`
      );
      if (!res.ok) throw new Error("Failed to fetch districts");
      const data = await res.json();
      setDistricts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isSignInPage && data.phone.length !== 10) {
      alert("Phone number must be 10 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:8000/api/${isSignInPage ? "login" : "register"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Combine country, city, and district into the body
          body: JSON.stringify({
            ...data,
            address: `${data.country}, ${data.city}, ${data.district}`, // Combine address here
          }),
        }
      );

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Network response was not ok");
      }

      if (!isSignInPage) {
        // Show alert for successful registration
        alert("Registration successful! You can now log in.");
        navigate("/account/signin"); // Navigate to login page after registration
        return; // Exit early to avoid further processing
      }

      const { token, user } = await res.json();
      localStorage.setItem("user:token", token);
      localStorage.setItem("user:detail", JSON.stringify(user));
      navigate("/");
    } catch (error) {
      alert(error.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <div className="h-full w-full max-w-[1400px] flex justify-center items-center border-4 border-black">
        <div
          className={`flex flex-col justify-center items-center h-full w-full border-8 border-green-500 ${
            !isSignInPage && "order-2"
          }`}
        >
          <h1 className="text-3xl">WELCOME {isSignInPage && "BACK"}</h1>
          <h2 className="mb-[50px]">
            PLEASE {isSignInPage ? "LOGIN" : "REGISTER"} TO CONTINUE
          </h2>
          {error && <div className="text-red-500">{error}</div>}
          <form className="w-[350px]" onSubmit={handleSubmit}>
            {!isSignInPage && (
              <>
                <Input
                  label="Username"
                  type="text"
                  placeholder="Enter your Username"
                  value={data.username}
                  onChange={(e) =>
                    setData({ ...data, username: e.target.value })
                  }
                  required
                  aria-label="Username"
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) =>
                    setData({ ...data, dateOfBirth: e.target.value })
                  }
                  required
                  aria-label="Date of Birth"
                />
                <Input
                  label="Phone Number"
                  type="text"
                  placeholder="Enter your Phone Number"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  required
                  aria-label="Phone Number"
                />
                <select
                  value={data.country}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="mb-4"
                  aria-label="Country"
                >
                  <option value="" disabled>
                    Select Country
                  </option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <select
                  value={data.city}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="mb-4"
                  aria-label="City"
                >
                  <option value="" disabled>
                    Select City
                  </option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <select
                  value={data.district}
                  onChange={(e) =>
                    setData({ ...data, district: e.target.value })
                  }
                  className="mb-4"
                  aria-label="District"
                >
                  <option value="" disabled>
                    Select District
                  </option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </>
            )}
            <Input
              label="Email"
              type="email"
              placeholder="Enter your Email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
              aria-label="Email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your Password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
              aria-label="Password"
            />
            <Button
              type="submit"
              label={isSignInPage ? "Sign in" : "Register"}
              className="my-5"
            />
            {loading && <div>Loading...</div>}
          </form>
          <div
            className="cursor-pointer text-md hover:text-green-500 underline"
            onClick={() =>
              navigate(
                `${isSignInPage ? "/account/signup" : "/account/signin"}`
              )
            }
          >
            {isSignInPage ? "Create new account" : "Sign in"}
          </div>
        </div>
        <div
          className={`flex justify-center items-center h-full w-full bg-gray-400 ${
            !isSignInPage && "order-1"
          }`}
        >
          {!isSignInPage ? (
            <img
              src={registerImage}
              alt="Register"
              className="object-cover w-full h-full rounded-lg"
            />
          ) : (
            <img
              src={loginImage}
              alt="Login"
              className="object-cover w-full h-full rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;
