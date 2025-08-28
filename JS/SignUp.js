const loginForm = async (e) => {
  e.preventDefault();

  const apiLogin = `http://localhost:3000/register`;

  const email = document.querySelector("#userEmail").value;
  const password = document.querySelector("#userPassword").value;

  document.getElementById("email_message").innerHTML = "";
  document.getElementById("pass_message").innerHTML = "";

  // Email Validation

  if (email === "") {
    document.getElementById("email_message").innerHTML =
      "Please Fill The Email Field";
    return false;
  } else if (email.indexOf("@") <= 0) {
    document.getElementById("email_message").innerHTML = "Invalid Email";
    return false;
  } else if (
    email.charAt(email.length - 4) !== "." &&
    email.charAt(email.length - 3) !== "."
  ) {
    document.getElementById("email_message").innerHTML = "Invalid Email Domain";
    return false;
  }

  // Password Validation

  if (password !== null) {
    if (password.trim() === "") {
      document.getElementById("pass_message").innerHTML =
        "Please Enter Password";
      return false;
    } else if (password.length > 8 && password.length > 20) {
      document.getElementById("pass_message").innerHTML =
        "Please Enter The Corrected Length";
      return false;
    } else {
      const UpperCase = /[A-Z]/.test(password);
      const LowerCase = /[a-z]/.test(password);
      const NumCase = /[0-9]/.test(password);
      const SpecialCase = /[!@#$%^&*\,.?":{}|<>]/.test(password);
      if (!UpperCase) {
        document.getElementById("pass_message").innerHTML =
          "Please Enter The One Upper Case In Password";
        return false;
      } else if (!LowerCase) {
        document.getElementById("pass_message").innerHTML =
          "Please Enter The One Lower Case In Password";
        return false;
      } else if (!NumCase) {
        document.getElementById("pass_message").innerHTML =
          "Please Enter The One Number In Password";
        return false;
      } else if (!SpecialCase) {
        document.getElementById("pass_message").innerHTML =
          "Please Enter The One Special Charater Case In Password";
        return false;
      }
    }
  }

  let userData = {
    email,
    password,
  };

  try {
    let res = await fetch(apiLogin, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    let data = await res.json();

    if (data.accessToken) window.location = "Login.html";
  } catch (error) {
    console.log("🚀 ~ error:", error);
  }
};

const home = () => {
  window.location = "Login.html";
};
