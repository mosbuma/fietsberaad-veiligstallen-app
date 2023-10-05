import React, { useState } from "react";
import ImageSlider from "~/components/ImageSlider";
import { Button } from "~/components/Button";
import { ParkingDetailsType } from "~/types";

const ParkingEditAfbeelding = ({
  parkingdata,
}: {
  parkingdata: ParkingDetailsType;
}) => {
  const [currentImage, setCurrentImage] = useState<string | null | undefined>(
    parkingdata.Image
  );
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const removeImage = () => {
    setCurrentImage(null);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const file = event.target.files?.[0];
    if (!file) return;

    // inspect actual formdata via fetch request: console.log will show empty object
    const data = new FormData();
    data.append('file', file);

    try {
      setUploadingImage(true);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentImage(data.imageUrl);
        setUploadingImage(false);
      } else {
        alert('Error uploading the image.');
        setUploadingImage(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error occurred.');
      setUploadingImage(false);
    }
  };

  return (
    <div>
      {currentImage ? (
        <>
          <div className="mb-8">
            <ImageSlider images={[currentImage]} />
            <img src={currentImage} />
          </div>
          <Button onClick={removeImage}>Remove Image</Button>
        </>
      ) : (
        <>
          <p>No image set</p>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {uploadingImage ? <p>Uploading image...</p> : null}
        </>
      )}
    </div>
  );
};

export default ParkingEditAfbeelding;
