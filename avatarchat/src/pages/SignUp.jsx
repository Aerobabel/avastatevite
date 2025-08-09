import React, { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";

export default function SignUp() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { signUp, setSession } = useSignUp();

  const handleSendCode = async () => {
    await signUp.create({ phoneNumber });
    await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
    setVerifying(true);
  };

  const handleVerify = async () => {
    const result = await signUp.attemptPhoneNumberVerification({ code });

    if (result.status === "complete") {
      await setSession(result.createdSessionId);
    } else {
      alert("Invalid code");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Sign Up</h2>
      <input
        placeholder="+1 555 123 4567"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        style={{ borderRadius: "50px", padding: "12px 20px", marginBottom: 16 }}
      />
      {!verifying ? (
        <button onClick={handleSendCode}>Send Code</button>
      ) : (
        <>
          <input
            placeholder="Enter Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ borderRadius: "50px", padding: "12px 20px", marginBottom: 16 }}
          />
          <button onClick={handleVerify}>Verify</button>
        </>
      )}
    </div>
  );
}
