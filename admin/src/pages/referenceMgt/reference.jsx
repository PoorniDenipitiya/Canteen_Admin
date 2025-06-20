/*import React, { useState } from 'react';
import axios from 'axios';
import './reference.css';

const ReferenceMgt = () => {
    const [formType, setFormType] = useState('category');
    const [formData, setFormData] = useState({
        category: '',
        image: '',
        description: ''
    });

    const handleFormSwitch = (type) => {
        setFormType(type);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('category', formData.category);
            formDataToSend.append('image', formData.image);
            formDataToSend.append('description', formData.description);

            const response = await axios.post('http://localhost:5000/api/category/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                window.location.href = 'http://localhost:3000/';
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container">
            <h1>Reference Management</h1>
            <div className="tabs">
                <div
                    className={`tab ${formType === 'category' ? 'active' : ''}`}
                    onClick={() => handleFormSwitch('category')}
                >
                    Category Registration
                </div>
                <div
                    className={`tab ${formType === 'food' ? 'active' : ''}`}
                    onClick={() => handleFormSwitch('food')}
                >
                    Food Registration
                </div>
            </div>

            {formType === 'category' && (
                <form onSubmit={handleSubmit}>
                    <h2>Category Registration</h2>
                    <div>
                        <label>Category:</label>
                        <input type="text" name="category" value={formData.category} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Image:</label>
                        <input type="file" name="image" onChange={handleFileChange} />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            )}

            {formType === 'food' && (
                <form>
                    <h2>Food Registration</h2>
                   <div>
                        <label>Canteen Name:</label>
                        <input type="text" name="canteen" />
                    </div> 
                    <div>
                        <label>Category:</label>
                        <input type="text" name="category" />
                    </div>
                    <div>
                        <label>Food:</label>
                        <input type="text" name="food" />
                    </div>
                    <div>
                        <label>Price:</label>
                        <input type="number" name="price" />
                    </div>
                    <div>
                        <label>Image:</label>
                        <input type="file" name="image" />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea name="description"></textarea>
                    </div>
                    <div>
                        <label>Available Time:</label>
                        <textarea name="time"></textarea>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            )}
        </div>
    );
};

export default ReferenceMgt;

*/

import React, { useState } from 'react';
import axios from 'axios';
import './reference.css';

const ReferenceMgt = () => {
  const [formType, setFormType] = useState('category');
  const [formData, setFormData] = useState({
    category: '',
    description: ''
  });
  const [foodData, setFoodData] = useState({
    canteen: '',
    category: '',
    food: '',
    price: '',
    description: '',
    time: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleFormSwitch = (type) => {
    setFormType(type);
    setMessage('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFoodChange = (e) => {
    setFoodData({ ...foodData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Validate inputs
      if (formType === 'category') {
        if (!formData.category || !formData.description) {
          setMessage('Please fill all required fields');
          setMessageType('error');
          setIsLoading(false);
          return;
        }

        if (!selectedImage) {
          setMessage('Please select an image');
          setMessageType('error');
          setIsLoading(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('category', formData.category);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('image', selectedImage);

        console.log('Sending form data:', {
          category: formData.category,
          description: formData.description,
          image: selectedImage.name
        });

        // Send data to the backend
        const response = await axios.post('http://localhost:5000/api/category/register', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Response from server:', response.data);

        if (response.data.success) {
          // Reset form
          setFormData({
            category: '',
            description: ''
          });
          setSelectedImage(null);
          document.getElementById('image-input').value = '';

          setMessage('Category registered successfully!');
          setMessageType('success');
        } else {
          setMessage(response.data.message || 'Unknown error occurred');
          setMessageType('error');
        }
      } else if (formType === 'food') {
        if (!foodData.canteen || !foodData.category || !foodData.food || !foodData.price || !foodData.description || !foodData.time) {
          setMessage('Please fill all required fields');
          setMessageType('error');
          setIsLoading(false);
          return;
        }

        if (!selectedImage) {
          setMessage('Please select an image');
          setMessageType('error');
          setIsLoading(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('canteen', foodData.canteen);
        formDataToSend.append('category', foodData.category);
        formDataToSend.append('food', foodData.food);
        formDataToSend.append('price', foodData.price);
        formDataToSend.append('description', foodData.description);
        formDataToSend.append('time', foodData.time);
        formDataToSend.append('image', selectedImage);

        console.log('Sending form data:', {
          canteen: foodData.canteen,
          category: foodData.category,
          food: foodData.food,
          price: foodData.price,
          description: foodData.description,
          time: foodData.time,
          image: selectedImage.name
        });

        // Send data to the backend
        const response = await axios.post('http://localhost:5000/api/food/register', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Response from server:', response.data);

        if (response.data.success) {
          // Reset form
          setFoodData({
            canteen: '',
            category: '',
            food: '',
            price: '',
            description: '',
            time: ''
          });
          setSelectedImage(null);
          document.getElementById('food-image-input').value = '';

          setMessage('Food registered successfully!');
          setMessageType('success');
        } else {
          setMessage(response.data.message || 'Unknown error occurred');
          setMessageType('error');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage(error.response?.data?.message || 'Failed to register category');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Reference Management</h1>
      <div className="tabs">
        <div className={`tab ${formType === 'category' ? 'active' : ''}`} onClick={() => handleFormSwitch('category')}>
          Category Registration
        </div>
        <div className={`tab ${formType === 'food' ? 'active' : ''}`} onClick={() => handleFormSwitch('food')}>
          Food Registration
        </div>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      {formType === 'category' && (
        <form onSubmit={handleSubmit}>
          <h2>Category Registration</h2>
          <div>
            <label>Category:</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} required />
          </div>
          <div>
            <label>Image:</label>
            <input id="image-input" type="file" name="image" onChange={handleFileChange} required />
            {selectedImage && <p className="file-selected">Selected: {selectedImage.name}</p>}
          </div>
          <div>
            <label>Description:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}

      {formType === 'food' && (
        <form onSubmit={handleSubmit}>
          <h2>Food Registration</h2>
          <div>
            <label>Canteen Name:</label>
            <input type="text" name="canteen" value={foodData.canteen} onChange={handleFoodChange} required />
          </div>
          <div>
            <label>Category:</label>
            <input type="text" name="category" value={foodData.category} onChange={handleFoodChange} required />
          </div>
          <div>
            <label>Food:</label>
            <input type="text" name="food" value={foodData.food} onChange={handleFoodChange} required />
          </div>
          <div>
            <label>Price:</label>
            <input type="number" name="price" value={foodData.price} onChange={handleFoodChange} required />
          </div>
          <div>
            <label>Image:</label>
            <input id="food-image-input" type="file" name="image" onChange={handleFileChange} required />
            {selectedImage && <p className="file-selected">Selected: {selectedImage.name}</p>}
          </div>
          <div>
            <label>Description:</label>
            <textarea name="description" value={foodData.description} onChange={handleFoodChange} required></textarea>
          </div>
          <div>
            <label>Available Time:</label>
            <textarea name="time" value={foodData.time} onChange={handleFoodChange} required></textarea>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReferenceMgt;
