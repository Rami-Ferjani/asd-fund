"use client";
import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";

export default function Page() {
  // ---- Donor form state ----
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorImageUrl, setDonorImageUrl] = useState("");
  const [selectedDonorId, setSelectedDonorId] = useState<Id<"donors"> | null>(
    null,
  );

  // ---- Donation form state ----
  // donationDonorId is the donor a new/edited donation belongs to.
  // It is intentionally separate from selectedDonorId so that picking a donor
  // for a donation does not put the donor form into "edit" mode.
  const [donationDonorId, setDonationDonorId] = useState<Id<"donors"> | null>(
    null,
  );
  const [donationAmount, setDonationAmount] = useState("");
  const [donationNote, setDonationNote] = useState("");
  const [selectedDonationId, setSelectedDonationId] =
    useState<Id<"donations"> | null>(null);

  // ---- Query-tester state ----
  const [searchDonorsTerm, setSearchDonorsTerm] = useState("");
  const [donorIdLookup, setDonorIdLookup] = useState("");
  const [searchDonationsTerm, setSearchDonationsTerm] = useState("");
  const [donationIdLookup, setDonationIdLookup] = useState("");

  // ---- Queries: list + total (always on) ----
  const donors = useQuery(api.donors.getDonors);
  const donations = useQuery(api.donations.getDonations);
  const totalRaised = useQuery(api.donations.getTotalRaised);

  // Derived: whether the currently-picked donation donor still exists. We avoid
  // setState-in-an-effect (which cascades renders) by computing this in render.
  const effectiveDonationDonorId =
    donationDonorId && donors && donors.some((d) => d._id === donationDonorId)
      ? donationDonorId
      : null;

  // ---- Queries: on-demand (skipped until there is input) ----
  const searchDonorsResult = useQuery(
    api.donors.searchDonors,
    searchDonorsTerm.trim() ? { search: searchDonorsTerm.trim() } : "skip",
  );
  const donorByIdResult = useQuery(
    api.donors.getDonorById,
    donorIdLookup.trim()
      ? { donorId: donorIdLookup.trim() as Id<"donors"> }
      : "skip",
  );
  const donationsByDonorResult = useQuery(
    api.donations.getDonationsByDonor,
    effectiveDonationDonorId ? { donorId: effectiveDonationDonorId } : "skip",
  );
  const searchDonationsResult = useQuery(
    api.donations.searchDonationsByDonor,
    searchDonationsTerm.trim()
      ? { search: searchDonationsTerm.trim() }
      : "skip",
  );
  const donationByIdResult = useQuery(
    api.donations.getDonationById,
    donationIdLookup.trim()
      ? { donationId: donationIdLookup.trim() as Id<"donations"> }
      : "skip",
  );

  // ---- Mutations ----
  const createDonor = useMutation(api.donors.createDonor);
  const updateDonor = useMutation(api.donors.updateDonor);
  const deleteDonor = useMutation(api.donors.deleteDonor);

  const createDonation = useMutation(api.donations.createDonation);
  const updateDonation = useMutation(api.donations.updateDonation);
  const deleteDonation = useMutation(api.donations.deleteDonation);

  // Donor id -> name map, for readable donation rows.
  const donorNameById = useMemo(() => {
    const map = new Map<Id<"donors">, string>();
    if (donors) {
      for (const d of donors) map.set(d._id, d.name);
    }
    return map;
  }, [donors]);

  // Populate the donation donor dropdown.
  const donorOptions = donors ?? [];

  // ---------------- Donor handlers ----------------
  const resetDonorForm = () => {
    setDonorName("");
    setDonorPhone("");
    setDonorImageUrl("");
    setSelectedDonorId(null);
  };

  const handleAddDonor = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createDonor({
        name: donorName,
        imageUrl: donorImageUrl,
        // phone is v.optional(v.string()) -> pass undefined, NOT null.
        phone: donorPhone ? donorPhone : undefined,
      });
      resetDonorForm();
    } catch (err) {
      console.error("Error adding donor:", err);
      alert("Failed to add donor");
    }
  };

  const handleUpdateDonor = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!selectedDonorId) return;
    try {
      // name and imageUrl are REQUIRED (v.string()) on updateDonor, so they
      // must always be provided. phone is optional -> undefined when empty.
      await updateDonor({
        donorId: selectedDonorId,
        name: donorName,
        imageUrl: donorImageUrl,
        phone: donorPhone ? donorPhone : undefined,
      });
      resetDonorForm();
    } catch (err) {
      console.error("Error updating donor:", err);
      alert("Failed to update donor");
    }
  };

  const handleDeleteDonor = async (id: Id<"donors">) => {
    try {
      await deleteDonor({ donorId: id });
      if (selectedDonorId === id) resetDonorForm();
    } catch (err) {
      console.error("Error deleting donor:", err);
      alert("Failed to delete donor");
    }
  };

  const handleSelectDonor = (donor: Doc<"donors"> | undefined) => {
    if (!donor) {
      resetDonorForm();
      return;
    }
    setSelectedDonorId(donor._id);
    setDonorName(donor.name);
    setDonorPhone(donor.phone ?? "");
    setDonorImageUrl(donor.imageUrl);
  };

  // ---------------- Donation handlers ----------------
  const resetDonationForm = () => {
    setDonationAmount("");
    setDonationNote("");
    setSelectedDonationId(null);
  };

  const handleAddDonation = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!effectiveDonationDonorId) {
      alert("Select a donor first");
      return;
    }
    const amount = parseFloat(donationAmount);
    if (Number.isNaN(amount)) {
      alert("Amount must be a number");
      return;
    }
    try {
      await createDonation({
        donorId: effectiveDonationDonorId,
        amount,
        // note is v.optional(v.string()) -> pass undefined, NOT null.
        note: donationNote ? donationNote : undefined,
      });
      resetDonationForm();
    } catch (err) {
      console.error("Error adding donation:", err);
      alert("Failed to add donation");
    }
  };

  const handleUpdateDonation = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!selectedDonationId) return;
    const amount = parseFloat(donationAmount);
    if (Number.isNaN(amount)) {
      alert("Amount must be a number");
      return;
    }
    try {
      // amount is REQUIRED (v.number()) on updateDonation, so it must always
      // be provided. note is optional -> undefined when empty.
      await updateDonation({
        donationId: selectedDonationId,
        amount,
        note: donationNote ? donationNote : undefined,
      });
      resetDonationForm();
    } catch (err) {
      console.error("Error updating donation:", err);
      alert("Failed to update donation");
    }
  };

  const handleDeleteDonation = async (id: Id<"donations">) => {
    try {
      await deleteDonation({ donationId: id });
      if (selectedDonationId === id) resetDonationForm();
    } catch (err) {
      console.error("Error deleting donation:", err);
      alert("Failed to delete donation");
    }
  };

  const handleSelectDonation = (donation: Doc<"donations"> | undefined) => {
    if (!donation) {
      resetDonationForm();
      return;
    }
    setSelectedDonationId(donation._id);
    setDonationDonorId(donation.donorId);
    setDonationAmount(donation.amount.toString());
    setDonationNote(donation.note ?? "");
  };

  // ---------------- Render ----------------
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Backend Test UI</h1>
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        {/* ---------------- Donors Section ---------------- */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <h2>Donors</h2>
          <form
            onSubmit={selectedDonorId ? handleUpdateDonor : handleAddDonor}
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <h3>{selectedDonorId ? "Update Donor" : "Add Donor"}</h3>
            <div style={{ marginBottom: "10px" }}>
              <label>Name:</label>
              <br />
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
                style={{ width: "100%", padding: "5px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Phone:</label>
              <br />
              <input
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                style={{ width: "100%", padding: "5px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Image URL:</label>
              <br />
              <input
                type="text"
                value={donorImageUrl}
                onChange={(e) => setDonorImageUrl(e.target.value)}
                required
                style={{ width: "100%", padding: "5px" }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: selectedDonorId ? "#007bff" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {selectedDonorId ? "Update Donor" : "Add Donor"}
            </button>
            {selectedDonorId && (
              <button
                type="button"
                onClick={resetDonorForm}
                style={{
                  marginLeft: "10px",
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel edit
              </button>
            )}
          </form>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "15px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            <h3>Donor List</h3>
            {donors ? (
              donorOptions.map((d) => (
                <div
                  key={d._id}
                  onClick={() => handleSelectDonor(d)}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    backgroundColor:
                      selectedDonorId === d._id ? "#e3f2fd" : "white",
                  }}
                >
                  <div>
                    <strong>{d.name}</strong>
                  </div>
                  {d.phone && <div>Phone: {d.phone}</div>}
                  {d.imageUrl && <div>Image: {d.imageUrl}</div>}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDonor(d._id);
                    }}
                    style={{
                      marginTop: "6px",
                      padding: "4px 10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p>Loading donors...</p>
            )}
          </div>
        </div>

        {/* ---------------- Donations Section ---------------- */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <h2>Donations</h2>
          <form
            onSubmit={
              selectedDonationId ? handleUpdateDonation : handleAddDonation
            }
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <h3>{selectedDonationId ? "Update Donation" : "Add Donation"}</h3>
            <div style={{ marginBottom: "10px" }}>
              <label>Donor:</label>
              <br />
              <select
                value={effectiveDonationDonorId ?? ""}
                onChange={(e) =>
                  setDonationDonorId(
                    e.target.value ? (e.target.value as Id<"donors">) : null,
                  )
                }
                style={{ width: "100%", padding: "5px" }}
              >
                <option value="">Select a donor</option>
                {donorOptions.map((opt) => (
                  <option key={opt._id} value={opt._id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Amount (€):</label>
              <br />
              <input
                type="number"
                step="0.01"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                required
                style={{ width: "100%", padding: "5px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Note:</label>
              <br />
              <input
                type="text"
                value={donationNote}
                onChange={(e) => setDonationNote(e.target.value)}
                style={{ width: "100%", padding: "5px" }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: selectedDonationId ? "#007bff" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {selectedDonationId ? "Update Donation" : "Add Donation"}
            </button>
            {selectedDonationId && (
              <button
                type="button"
                onClick={resetDonationForm}
                style={{
                  marginLeft: "10px",
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel edit
              </button>
            )}
          </form>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "15px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            <h3>Donation List</h3>
            {donations ? (
              donations.map((d) => (
                <div
                  key={d._id}
                  onClick={() => handleSelectDonation(d)}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    backgroundColor:
                      selectedDonationId === d._id ? "#e3f2fd" : "white",
                  }}
                >
                  <div>
                    <strong>Amount: €{d.amount}</strong>
                  </div>
                  {d.note && <div>Note: {d.note}</div>}
                  <div>Donor: {donorNameById.get(d.donorId) ?? d.donorId}</div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDonation(d._id);
                    }}
                    style={{
                      marginTop: "6px",
                      padding: "4px 10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p>Loading donations...</p>
            )}
          </div>
        </div>

        {/* ---------------- Query Testers Section ---------------- */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <h2>Query Testers</h2>

          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <h3>getTotalRaised</h3>
            <div>
              <strong>Total:</strong> €{totalRaised ?? "…"}
            </div>
          </div>

          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <h3>searchDonors</h3>
            <input
              type="text"
              placeholder="donor name…"
              value={searchDonorsTerm}
              onChange={(e) => setSearchDonorsTerm(e.target.value)}
              style={{ width: "100%", padding: "5px", marginBottom: "8px" }}
            />
            {searchDonorsResult === undefined ? (
              <p>skipped / loading…</p>
            ) : searchDonorsResult.length === 0 ? (
              <p>No matches</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {searchDonorsResult.map((d) => (
                  <li key={d._id}>{d.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <h3>getDonorById</h3>
            <input
              type="text"
              placeholder="donor id…"
              value={donorIdLookup}
              onChange={(e) => setDonorIdLookup(e.target.value)}
              style={{ width: "100%", padding: "5px", marginBottom: "8px" }}
            />
            {donorByIdResult === undefined ? (
              <p>skipped / loading…</p>
            ) : donorByIdResult === null ? (
              <p>Not found</p>
            ) : (
              <pre style={{ margin: 0 }}>
                {JSON.stringify(donorByIdResult, null, 2)}
              </pre>
            )}
          </div>

          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <h3>getDonationsByDonor</h3>
            <p style={{ margin: "0 0 8px", color: "#666" }}>
              Uses the donor selected in the Donations form.{" "}
              {effectiveDonationDonorId
                ? `(selected: ${donorNameById.get(effectiveDonationDonorId) ?? effectiveDonationDonorId})`
                : "(none selected)"}
            </p>
            {donationsByDonorResult === undefined ? (
              <p>skipped / loading…</p>
            ) : donationsByDonorResult.length === 0 ? (
              <p>No donations</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {donationsByDonorResult.map((d) => (
                  <li key={d._id}>
                    €{d.amount}
                    {d.note ? ` — ${d.note}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <h3>searchDonationsByDonor</h3>
            <input
              type="text"
              placeholder="donor name…"
              value={searchDonationsTerm}
              onChange={(e) => setSearchDonationsTerm(e.target.value)}
              style={{ width: "100%", padding: "5px", marginBottom: "8px" }}
            />
            {searchDonationsResult === undefined ? (
              <p>skipped / loading…</p>
            ) : searchDonationsResult.length === 0 ? (
              <p>No matches</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {searchDonationsResult.map((d) => (
                  <li key={d._id}>
                    €{d.amount} — {donorNameById.get(d.donorId) ?? d.donorId}
                    {d.note ? ` (${d.note})` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <h3>getDonationById</h3>
            <input
              type="text"
              placeholder="donation id…"
              value={donationIdLookup}
              onChange={(e) => setDonationIdLookup(e.target.value)}
              style={{ width: "100%", padding: "5px", marginBottom: "8px" }}
            />
            {donationByIdResult === undefined ? (
              <p>skipped / loading…</p>
            ) : donationByIdResult === null ? (
              <p>Not found</p>
            ) : (
              <pre style={{ margin: 0 }}>
                {JSON.stringify(donationByIdResult, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
