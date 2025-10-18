/**
 * @file SpecialWasteCollection.test.jsx
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import SpecialWasteCollection from "../SpecialWasteCollection";

jest.mock("../../services/api"); // Mock API calls

// Mock Google Maps global objects
beforeAll(() => {
  global.window.google = {
    maps: {
      Map: jest.fn().mockImplementation(() => ({
        addListener: jest.fn(),
        setCenter: jest.fn(),
      })),
      Marker: jest.fn().mockImplementation(() => ({
        addListener: jest.fn(),
        setPosition: jest.fn(),
      })),
      Geocoder: jest.fn().mockImplementation(() => ({
        geocode: jest.fn((args, callback) =>
          callback([{ formatted_address: "Test Address" }], "OK")
        ),
      })),
      Animation: { DROP: "DROP" },
    },
  };
});

const mockUser = { id: "user123", name: "Test User" };

const renderComponent = () =>
  render(
    <AuthContext.Provider value={{ user: mockUser }}>
      <BrowserRouter>
        <SpecialWasteCollection />
      </BrowserRouter>
    </AuthContext.Provider>
  );

describe("🧩 SpecialWasteCollection Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders main title and form sections", () => {
    renderComponent();

    expect(
      screen.getByText("Schedule Special Waste Collection")
    ).toBeInTheDocument();

    expect(screen.getByText("1. Collection Details")).toBeInTheDocument();
    expect(screen.getByText("2. Preferred Date & Time")).toBeInTheDocument();
  });

  test("updates form fields correctly", () => {
    renderComponent();

    const categorySelect = screen.getByLabelText(/Type of Waste/i);
    fireEvent.change(categorySelect, { target: { value: "hazardous" } });
    expect(categorySelect.value).toBe("hazardous");

    const weightInput = screen.getByPlaceholderText(/e\.g\., 5\.5/i);
    fireEvent.change(weightInput, { target: { value: "10" } });
    expect(weightInput.value).toBe("10");
  });

  test("shows validation when trying to submit without required fields", async () => {
    renderComponent();

    const submitButton = screen.getByText(/Check Availability/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Please select a time slot/i)
      ).toBeInTheDocument();
    });
  });

  test("displays estimated cost when weight and category selected", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Type of Waste/i), {
      target: { value: "electronic" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\., 5\.5/i), {
      target: { value: "10" },
    });

    await waitFor(() => {
      expect(screen.getByText(/Rs\./i)).toBeInTheDocument();
    });
  });

  test("calls API when submitting valid form", async () => {
    api.post.mockResolvedValueOnce({
      data: { request: { id: "req123" } },
    });

    renderComponent();

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Type of Waste/i), {
      target: { value: "recyclable" },
    });
    fireEvent.change(screen.getByLabelText(/Preferred Collection Date/i), {
      target: { value: "2025-12-25" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your complete address/i), {
      target: { value: "Colombo 05" },
    });

    // Select time slot
    fireEvent.click(screen.getByText("8:00 AM - 10:00 AM"));

    // Submit form
    fireEvent.click(screen.getByText(/Check Availability/i));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/collections/schedule",
        expect.objectContaining({
          userId: mockUser.id,
          wasteCategory: "recyclable",
        })
      );
    });
  });

  test("displays error message when API fails", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: "Failed to schedule collection." } },
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Type of Waste/i), {
      target: { value: "organic" },
    });
    fireEvent.change(screen.getByLabelText(/Preferred Collection Date/i), {
      target: { value: "2025-12-25" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your complete address/i), {
      target: { value: "Negombo" },
    });

    fireEvent.click(screen.getByText("8:00 AM - 10:00 AM"));
    fireEvent.click(screen.getByText(/Check Availability/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to schedule collection./i)
      ).toBeInTheDocument();
    });
  });
});
