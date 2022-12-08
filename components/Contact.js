import React, { useState, useRef } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ClearIcon from "@mui/icons-material/Clear";
import FmdBadIcon from "@mui/icons-material/FmdBad";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import { Alert, Snackbar } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';
export default function ContactUs() {
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState({});
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fileRef = useRef();
  const formRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSubmit = async (e) => {
    let message = document.getElementById("message");
    e.preventDefault();
    if (!formRef.current) {
      console.log("Something wrong with form ref");
      return;
    }
    setLoading(true);
    let fd = new FormData();
    if (fileRef.current.files.length > 0) {
      fd.append("file", fileRef.current.files[0]);
      try {
        const { data } = await axios.post("/api/upload", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        try {
          const { data: contactData } = await axios.post(
            "/api/contact",
            { ...formData, ...data },
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                body: { ...formData, ...data },
              },
            }
          );
          if (contactData) {
            message.value = "";
            setSuccess(true);
            setFormData({});
            setError({});
            setUploadError(null);
            setTimeout(() => {
              setSuccess(false);
            }, 4000);
          }
        } catch (error) {
          setIsError(true);
          console.log(error.message);
          if (error.response.status === 413) {
            setUploadError("File is bigger than 1mb");
          }
          setTimeout(() => {
            setIsError(false);
          }, 4000);
        }
      } catch (error) {
        setIsError(true);

        setTimeout(() => {
          setIsError(false);
        }, 4000);
        setUploadError(error.response?.data);
      }
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.post("/api/contact", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          body: formData,
        },
      });
      if (data) {
        setSuccess(true);
        message.value = "";
        setFormData({});
        setError({});
        setTimeout(() => {
          setSuccess(false);
        }, 4000);
      }
    } catch (error) {
      setError(error.response.data);
    }
    setUploadError(null);
    setLoading(false);
  };

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={success}
        autoHideDuration={6000}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Your message was successfully sent!
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isError}
        autoHideDuration={6000}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          Something went wrong, please try again
        </Alert>
      </Snackbar>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: "url(https://source.unsplash.com/random)",
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) =>
            t.palette.mode === "light"
              ? t.palette.grey[50]
              : t.palette.grey[900],
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h3" fontWeight={600}>
            Get in touch
          </Typography>
          <form ref={formRef} onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              label="Full name"
              autoFocus
              name="name"
              value={formData.name ?? ""}
              onChange={handleChange}
              id="full-name"
              autoComplete="name"
              placeholder="Full name"
              error={error.name}
              helperText={error.name?.[0]}
            />
            <TextField
              margin="normal"
              fullWidth
              autoFocus
              label="Email"
              id="email"
              name="email"
              value={formData.email ?? ""}
              onChange={handleChange}
              autoComplete="email"
              placeholder="Email"
              error={error.email}
              helperText={error.email?.[0]}
            />
            <TextField
              margin="normal"
              fullWidth
              autoFocus
              name="phone"
              type="number"
              label="Phone"
              onChange={handleChange}
              value={formData.phone ?? ""}
              id="phone"
              autoComplete="tel"
              placeholder="Phone"
              error={error.phone}
              helperText={error.phone?.[0]}
            />
            <TextField
              id="message"
              label="Message"
              multiline
              rows={4}
              fullWidth
              name="message"
              sx={{ mt: 3 }}
              onChange={handleChange}
              value={formData.message}
              error={error.message}
              helperText={error.message?.[0]}
            />
            <Box
              sx={{ mt: 3, display: "flex", gap: "1rem", alignItems: "center" }}
            >
              <Button
                sx={{ fontWeight: 500 }}
                variant="outlined"
                component="label"
                startIcon={<FileUploadIcon />}
              >
                Upload files
                <input
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      attachments: e.target.files[0],
                    });
                  }}
                  ref={fileRef}
                  accept="*"
                  hidden
                  type="file"
                />
              </Button>
              <Box sx={{ display: "flex", gap: "2px" }}>
                <FmdBadIcon fontSize="small" />
                <Typography noWrap variant="span" component="h5">
                  Limit 1MB
                </Typography>
              </Box>
            </Box>
            {!!formData.attachments && (
              <Box sx={{ mt: 3, display: "flex", alignItems: "center" }}>
                <Typography noWrap variant="span" component="h5">
                  {formData.attachments.name}
                </Typography>
                <ClearIcon
                  onClick={(e) => {
                    setFormData({
                      ...formData,
                      attachments: "",
                    });
                    fileRef.current.value = "";
                  }}
                  sx={{ cursor: "pointer" }}
                  fontSize="small"
                />
              </Box>
            )}
            {!!uploadError && typeof uploadError === "string" && (
              <Typography variant="span" component="h5" sx={{ color: "red" }}>
                {uploadError}
              </Typography>
            )}
            {loading ? (
              <LoadingButton
                sx={{ mt: 3, mb: 2 }}
                loading
                loadingPosition="end"
                variant="contained"
                endIcon={<DataSaverOffIcon/>}
              >
                Sending
              </LoadingButton>
            ) : (
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                endIcon={<SendIcon />}
              >
                Send
              </Button>
            )}
          </form>
        </Box>
      </Grid>
    </Grid>
  );
}
