import React, { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { signIn, setSession } = useSignIn();

  const handleSendCode = async () => {
    const { supportedFirstFactors } = await signIn.create({ identifier: phoneNumber });
    const smsFactor = supportedFirstFactors.find(f => f.strategy === "phone_code");

    await signIn.prepareFirstFactor({ strategy: "phone_code", phoneNumber });
    setVerifying(true);
  };

  const handleVerify = async () => {
    const result = await signIn.attemptFirstFactor({
      strategy: "phone_code",
      code,
    });

    if (result.status === "complete") {
      window.location.assign('/');
      
      await setSession(result.createdSessionId);
  
    } else {
      alert("Invalid code");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Sign In</h2>
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
