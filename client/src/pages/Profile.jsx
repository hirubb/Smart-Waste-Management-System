import React, { useState, useContext, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaEdit } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: ""
  });

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.contactNumber || "",
        address: user.address || "",
        role: user.role || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Prepare data with contactNumber field name for API
      const updateData = {
        name: formData.name,
        email: formData.email,
        contactNumber: formData.phone,
        address: formData.address
      };

      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Update user profile via API with authentication header
      const response = await axios.put('http://localhost:4000/api/auth/update-profile', updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleLabels = {
      authority: "WMA Manager/Admin",
      collector: "Waste Collector",
      resident: "Resident",
      business: "Business"
    };
    return roleLabels[role] || role;
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div className="mb-3">
        <span className="text-muted">Dashboard</span>
        <span className="mx-2 text-muted">{'>'}</span>
        <span className="fw-bold">Profile</span>
      </div>

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">My Profile</h2>
        <p className="text-muted">
          View and manage your personal information
        </p>
      </div>

      <Row>
        <Col lg={4} md={12} className="mb-4">
          {/* Profile Card */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <div 
                className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '120px', height: '120px', fontSize: '3rem' }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h4 className="fw-bold mb-1">{user?.name}</h4>
              <p className="text-muted mb-3">{user?.email}</p>
              <span className="badge bg-primary px-3 py-2">
                {getRoleBadge(user?.role)}
              </span>
            </Card.Body>
          </Card>

          {/* Additional Info Card */}
          <Card className="border-0 shadow-sm mt-3">
            <Card.Body>
              <h6 className="fw-bold mb-3">Account Information</h6>
              <div className="mb-2">
                <small className="text-muted">Member Since</small>
                <p className="mb-0">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="mb-2">
                <small className="text-muted">Account Status</small>
                <p className="mb-0">
                  <span className="badge bg-success">Active</span>
                </p>
              </div>
              <div>
                <small className="text-muted">User ID</small>
                <p className="mb-0 text-truncate">{user?._id || 'N/A'}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8} md={12}>
          {/* Profile Details Card */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 fw-bold">Profile Details</h5>
              {!isEditing && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit className="me-2" />
                  Edit Profile
                </Button>
              )}
            </Card.Header>
            <Card.Body className="p-4">
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess("")}>
                  {success}
                </Alert>
              )}

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaUser className="me-2 text-muted" />
                        Full Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaEnvelope className="me-2 text-muted" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaPhone className="me-2 text-muted" />
                        Phone Number
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter phone number"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Account Role
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={getRoleBadge(formData.role)}
                        disabled
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaMapMarkerAlt className="me-2 text-muted" />
                    Address
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your address"
                  />
                </Form.Group>

                {isEditing && (
                  <div className="d-flex gap-2 justify-content-end">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data to original user data
                        if (user) {
                          setFormData({
                            name: user.name || "",
                            email: user.email || "",
                            phone: user.contactNumber || "",
                            address: user.address || "",
                            role: user.role || ""
                          });
                        }
                        setError("");
                        setSuccess("");
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>

          {/* Security Settings Card */}
          <Card className="border-0 shadow-sm mt-3">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">Security Settings</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="mb-1">Password</h6>
                  <small className="text-muted">Last changed 30 days ago</small>
                </div>
                <Button variant="outline-primary" size="sm">
                  Change Password
                </Button>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Two-Factor Authentication</h6>
                  <small className="text-muted">Add an extra layer of security</small>
                </div>
                <Button variant="outline-secondary" size="sm">
                  Enable
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;

