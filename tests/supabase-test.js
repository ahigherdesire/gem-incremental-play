import {
  supabase
} from "../src/backend/supabase.js";

const status =
  document.getElementById("status");

async function testConnection() {
  try {
    const {
      data,
      error
    } =
      await supabase.auth.getSession();

    if (error) {
      console.error(
        "Supabase error:",
        error
      );

      status.textContent =
        "❌ Connection failed";

      return;
    }

    console.log(
      "Supabase response:",
      data
    );

    status.textContent =
      "✅ Supabase connection works!";
  } catch (error) {
    console.error(
      "Unexpected error:",
      error
    );

    status.textContent =
      "❌ Connection failed";
  }
}

testConnection();
