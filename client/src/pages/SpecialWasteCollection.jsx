import React, { useState, useContext, useEffect, useRef } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SpecialWasteCollection = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    wasteCategory: "",
    scheduledDate: "",
    scheduledTime: "",
    pickupAddress: "",
    pickupLatitude: "",
    pickupLongitude: "",
    quantity: "",
    notes: "",
    weight: "",
  });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 }); // Colombo default
  const [markerPosition, setMarkerPosition] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const wasteCategories = [
    { value: "general", label: "General" },
    { value: "recyclable", label: "Recyclable" },
    { value: "organic", label: "Organic" },
    { value: "hazardous", label: "Hazardous" },
    { value: "bulky", label: "Bulky" },
    { value: "electronic", label: "Electronic" },
    { value: "medical", label: "Medical" },
  ];

  const timeSlots = [
    "8:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "1:00 PM - 3:00 PM",
    "3:00 PM - 5:00 PM",
  ];

  // Calculate estimated cost based on model logic
  const calculateEstimatedCost = (category, weight) => {
    const basePrices = {
      general: 100,
      recyclable: 80,
      organic: 90,
      hazardous: 200,
      bulky: 150,
      electronic: 180,
      medical: 250,
    };

    let cost = basePrices[category] || 100;
    cost *= 1.5; // Special collection multiplier

    if (weight && !isNaN(weight)) {
      cost += parseFloat(weight) * 10;
    }

    return Math.round(cost);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Update cost estimate when category or weight changes
    if (name === "wasteCategory" || name === "weight") {
      const cost = calculateEstimatedCost(
        name === "wasteCategory" ? value : formData.wasteCategory,
        name === "weight" ? value : formData.weight
      );
      setEstimatedCost(cost);
    }
  };

  const handleQuickSelect = (value) => {
    setFormData({ ...formData, wasteCategory: value });
    const cost = calculateEstimatedCost(value, formData.weight);
    setEstimatedCost(cost);
  };

  const handleTimeSlotSelect = (slot) => {
    setFormData({ ...formData, scheduledTime: slot });
  };

  // Initialize map when modal opens
  useEffect(() => {
    if (showMapModal && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [showMapModal]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(pos);
          setMarkerPosition(pos);
          reverseGeocode(pos.lat, pos.lng);
        },
        () => {
          console.log("Error: The Geolocation service failed.");
        }
      );
    }
  };

  // Initialize Google Map
  const initializeMap = () => {
    if (!window.google) {
      console.error("Google Maps not loaded");
      return;
    }

    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const marker = new window.google.maps.Marker({
      map: map,
      position: markerPosition || mapCenter,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });

    // Update position on marker drag
    marker.addListener("dragend", (event) => {
      const newPos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setMarkerPosition(newPos);
      reverseGeocode(newPos.lat, newPos.lng);
    });

    // Update position on map click
    map.addListener("click", (event) => {
      const newPos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      marker.setPosition(event.latLng);
      setMarkerPosition(newPos);
      reverseGeocode(newPos.lat, newPos.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = (lat, lng) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setFormData((prev) => ({
          ...prev,
          pickupAddress: results[0].formatted_address,
        }));
      }
    });
  };

  // Confirm location selection
  const confirmLocation = () => {
    if (markerPosition) {
      setFormData({
        ...formData,
        pickupLatitude: markerPosition.lat.toString(),
        pickupLongitude: markerPosition.lng.toString(),
      });
    }
    setShowMapModal(false);
  };

  // Search location
  const searchLocation = (address) => {
    if (!window.google || !address) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const pos = {
          lat: location.lat(),
          lng: location.lng(),
        };

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(pos);
        }
        if (markerRef.current) {
          markerRef.current.setPosition(pos);
        }

        setMapCenter(pos);
        setMarkerPosition(pos);
        setFormData((prev) => ({
          ...prev,
          pickupAddress: results[0].formatted_address,
        }));
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const requestData = {
        userId: user?.id,
        requestType: "special",
        wasteCategory: formData.wasteCategory,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        pickupLocation: {
          address: formData.pickupAddress,
          latitude: formData.pickupLatitude
            ? parseFloat(formData.pickupLatitude)
            : undefined,
          longitude: formData.pickupLongitude
            ? parseFloat(formData.pickupLongitude)
            : undefined,
        },
        notes: formData.notes,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        estimatedCost: estimatedCost,
      };
      

      const res = await api.post("/collections/schedule", requestData);

      navigate("/collection-summary", {
        state: {
          request: res.data.request,
          formData,
          estimatedCost,
        },
      });

      // Reset form
      setFormData({
        wasteCategory: "",
        scheduledDate: "",
        scheduledTime: "",
        pickupAddress: "",
        pickupLatitude: "",
        pickupLongitude: "",
        quantity: "",
        notes: "",
        weight: "",
      });
      setEstimatedCost(0);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        "Failed to schedule collection. Please try again.";
      setMessage({ type: "danger", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: "1100px" }}>
      {/* Google Maps Script */}
      <script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyAQb6Asc-RcDV1bKvNno1eW79mRMlf35AU&libraries=places`}
        async
        defer
      ></script>

      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">Schedule Special Waste Collection</h5>
              <small className="text-muted">
                Please fill in the details below for your special waste
                collection.
              </small>
            </div>
            {estimatedCost > 0 && (
              <div className="text-end">
                <small className="text-muted d-block">Estimated Cost</small>
                <strong className="text-success fs-5">
                  Rs. {estimatedCost}
                </strong>
              </div>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-4">
          {message.text && (
            <Alert variant={message.type} className="mb-4">
              {message.text}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Left Column - Collection Details */}
              <Col md={6} className="border-end pe-4">
                <h6 className="fw-bold mb-3">1. Collection Details</h6>

                {/* Type of Waste Dropdown */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Type of Waste *
                  </Form.Label>
                  <Form.Select
                    name="wasteCategory"
                    value={formData.wasteCategory}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select waste type ▼</option>
                    {wasteCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Weight Input */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Estimated Weight (kg)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="weight"
                    placeholder="e.g., 5.5"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Used for cost calculation (Rs. 10 per kg)
                  </Form.Text>
                </Form.Group>

                {/* Estimated Quantity */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Estimated Quantity (in items or bags)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="quantity"
                    placeholder="e.g., 3"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Special Instructions */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Special Instructions (Optional)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    name="notes"
                    rows={3}
                    placeholder="e.g., Leave by the side gate."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Interactive Location Map */}
                <div className="mb-3">
                  <Form.Label className="fw-semibold">
                    Pickup Location Map
                  </Form.Label>
                  <div
                    className="border rounded p-4 text-center bg-light position-relative"
                    style={{
                      minHeight: "180px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowMapModal(true)}
                  >
                    {formData.pickupLatitude && formData.pickupLongitude ? (
                      <>
                        <div className="text-success mb-2">
                          <i
                            className="bi bi-geo-alt-fill"
                            style={{ fontSize: "2rem" }}
                          ></i>
                        </div>
                        <small className="text-muted">Location Selected</small>
                        <small className="text-dark fw-semibold mt-1">
                          {formData.pickupLatitude.substring(0, 8)},{" "}
                          {formData.pickupLongitude.substring(0, 8)}
                        </small>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMapModal(true);
                          }}
                        >
                          Change Location
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-secondary mb-2">
                          <i
                            className="bi bi-map"
                            style={{ fontSize: "2rem" }}
                          ></i>
                        </div>
                        <span className="text-muted">
                          Click to select pickup location on map
                        </span>
                        <Button
                          variant="primary"
                          size="sm"
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMapModal(true);
                          }}
                        >
                          Open Map
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Col>

              {/* Right Column - Date & Time */}
              <Col md={6} className="ps-4">
                <h6 className="fw-bold mb-3">2. Preferred Date & Time</h6>

                {/* Date Picker */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Preferred Collection Date *
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="scheduledDate"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Time Slot Selection */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    Preferred Time Slot *
                  </Form.Label>
                  <Row className="g-2">
                    {timeSlots.map((slot) => (
                      <Col xs={6} key={slot}>
                        <Button
                          variant={
                            formData.scheduledTime === slot
                              ? "dark"
                              : "outline-secondary"
                          }
                          className="w-100"
                          onClick={() => handleTimeSlotSelect(slot)}
                          type="button"
                        >
                          {slot}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                  {!formData.scheduledTime && (
                    <Form.Text className="text-danger">
                      Please select a time slot
                    </Form.Text>
                  )}
                </Form.Group>

                {/* Pickup Location */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Pickup Address *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="pickupAddress"
                    placeholder="Enter your complete address"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Optional: GPS Coordinates */}
                <Row className="mb-3">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        Latitude (Optional)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        name="pickupLatitude"
                        placeholder="e.g., 6.9271"
                        value={formData.pickupLatitude}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        Longitude (Optional)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        name="pickupLongitude"
                        placeholder="e.g., 79.8612"
                        value={formData.pickupLongitude}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Cost Breakdown */}
                {estimatedCost > 0 && (
                  <Alert variant="info" className="mb-3">
                    <small>
                      <strong>Cost Breakdown:</strong>
                      <br />
                      Base Price: Rs.{" "}
                      {Math.round(
                        calculateEstimatedCost(formData.wasteCategory, 0) / 1.5
                      )}
                      <br />
                      Special Collection (1.5x): Rs.{" "}
                      {Math.round(
                        calculateEstimatedCost(formData.wasteCategory, 0)
                      )}
                      {formData.weight && (
                        <>
                          <br />
                          Weight Charge ({formData.weight} kg × Rs. 10): Rs.{" "}
                          {parseFloat(formData.weight) * 10}
                        </>
                      )}
                      <br />
                      <strong>Total: Rs. {estimatedCost}</strong>
                    </small>
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => {
                      setFormData({
                        wasteCategory: "",
                        scheduledDate: "",
                        scheduledTime: "",
                        pickupAddress: "",
                        pickupLatitude: "",
                        pickupLongitude: "",
                        quantity: "",
                        notes: "",
                        weight: "",
                      });
                      setEstimatedCost(0);
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button
                    variant="success"
                    type="submit"
                    disabled={loading || !formData.scheduledTime}
                  >
                    {loading ? "Scheduling..." : "Check Availability"}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Map Modal */}
      <Modal
        show={showMapModal}
        onHide={() => setShowMapModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Pickup Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Search Bar */}
          <div className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search for an address..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  searchLocation(e.target.value);
                }
              }}
            />
            <Form.Text className="text-muted">
              Press Enter to search or click on the map to select location
            </Form.Text>
          </div>

          {/* Current Location Button */}
          <div className="mb-3 d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={getCurrentLocation}
            >
              <i className="bi bi-geo-alt-fill me-1"></i>
              Use Current Location
            </Button>
          </div>

          {/* Map Container */}
          <div
            ref={mapRef}
            style={{
              width: "100%",
              height: "400px",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
            }}
          ></div>

          {/* Selected Address Display */}
          {formData.pickupAddress && (
            <Alert variant="info" className="mt-3 mb-0">
              <strong>Selected Address:</strong>
              <br />
              {formData.pickupAddress}
            </Alert>
          )}

          {markerPosition && (
            <div className="mt-2 text-muted small">
              Coordinates: {markerPosition.lat.toFixed(6)},{" "}
              {markerPosition.lng.toFixed(6)}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMapModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={confirmLocation}
            disabled={!markerPosition}
          >
            Confirm Location
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SpecialWasteCollection;
