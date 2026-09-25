'use client';

import { ChangeEvent, useEffect, useState } from "react";

const AboutSection = () => {
  const [data, setData] = useState("https://www.google.com/");
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const updateQrValue = async () => {
      if (!data.trim()) {
        setQrValue("");
        return;
      }

      const response = await fetch(
        `/api/qr-token?destination=${encodeURIComponent(data.trim())}`,
        { cache: "no-store" },
      );

      if (!isCurrent) {
        return;
      }

      if (!response.ok) {
        setQrValue("");
        return;
      }

      const result: { url: string } = await response.json();
      setQrValue(result.url);
    };

    updateQrValue();
    const intervalId = window.setInterval(updateQrValue, 5_000);

    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
    };
  }, [data]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setData(event.currentTarget.value);
  };

  return (
    <section className="about-section">
      <label htmlFor="qr-data">Input data</label>
      <input
        id="qr-data"
        type="text"
        value={data}
        onChange={handleChange}
        placeholder="https://contoh.com"
      />

      {qrValue ? (
        <div className="card">
          <div className="qr-preview">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrValue)}`}
              alt="QR Preview"
              width={680}
              height={180}
            />
          </div>
        </div>
      ) : (
        <p>Masukkan URL http atau https untuk membuat QR.</p>
      )}
    </section>
  );
};

export default AboutSection;
