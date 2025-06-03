// server.js - Complete backend server with Zoom API integration
const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve your HTML/CSS/JS files from 'public' folder

// Environment variables you need to set in .env file
const {
  ZOOM_CLIENT_ID,
  ZOOM_CLIENT_SECRET,
  ZOOM_ACCOUNT_ID,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST,
  EMAIL_PORT
} = process.env;

// Configure email transporter
const emailTransporter = nodemailer.createTransport({
  host: EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS // Use App Password for Gmail
  }
});

// Test email configuration on startup
emailTransporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
  } else {
    console.log('✅ Email server is ready');
  }
});

/**
 * Get Zoom access token using Server-to-Server OAuth
 */
async function getZoomAccessToken() {
  try {
    const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'account_credentials',
        account_id: ZOOM_ACCOUNT_ID
      },
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('✅ Zoom access token obtained');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Error getting Zoom access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Zoom API');
  }
}

/**
 * Create a Zoom meeting
 */
async function createZoomMeeting(accessToken, meetingData) {
  try {
    const meetingPayload = {
      topic: meetingData.title,
      type: 2, // Scheduled meeting
      start_time: meetingData.start_time || new Date().toISOString(),
      duration: meetingData.duration || 60, // Default 60 minutes
      timezone: 'Europe/Lisbon',
      agenda: `Aula de ${meetingData.title}`,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 0, // Automatically approve
        audio: 'both', // Both telephone and computer audio
        auto_recording: 'none',
        waiting_room: true,
        allow_multiple_devices: true
      }
    };

    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', meetingPayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Zoom meeting created:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating Zoom meeting:', error.response?.data || error.message);
    throw new Error('Failed to create Zoom meeting');
  }
}

/**
 * Send meeting details via email to both participants
 */
async function sendMeetingEmails(hostEmail, guestEmail, meetingData, zoomMeetingData) {
  const startTime = new Date(zoomMeetingData.start_time);
  const formattedDate = startTime.toLocaleDateString('pt-PT');
  const formattedTime = startTime.toLocaleTimeString('pt-PT', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6D7A65; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .meeting-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { display: inline-block; background: #6D7A65; color: white; padding: 12px 25px; 
                  text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 Aula Agendada - EduLink</h1>
        </div>
        
        <div class="content">
          <h2>Olá! 👋</h2>
          <p>A sua aula foi agendada com sucesso!</p>
          
          <div class="meeting-details">
            <h3>📝 Detalhes da Aula</h3>
            <p><strong>Tópico:</strong> ${meetingData.title}</p>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Horário:</strong> ${formattedTime}</p>
            <p><strong>Duração:</strong> ${zoomMeetingData.duration} minutos</p>
          </div>
          
          <div class="meeting-details">
            <h3>🎥 Informações da Reunião Zoom</h3>
            <p><strong>ID da Reunião:</strong> ${zoomMeetingData.id}</p>
            ${zoomMeetingData.password ? `<p><strong>Senha:</strong> ${zoomMeetingData.password}</p>` : ''}
            
            <a href="${zoomMeetingData.join_url}" class="button">🚀 Entrar na Reunião</a>
          </div>
          
          <div class="meeting-details">
            <h3>📋 Instruções</h3>
            <ul>
              <li>Clique no botão acima ou use o link: <br><code>${zoomMeetingData.join_url}</code></li>
              <li>Se solicitado, use o ID da reunião: <strong>${zoomMeetingData.id}</strong></li>
              <li>Certifique-se de ter uma boa conexão à internet</li>
              <li>Teste o seu microfone e câmara antes da aula</li>
              <li>Tenha o material de estudo preparado</li>
            </ul>
          </div>
          
          <p>Se tiver alguma dúvida, não hesite em contactar-nos.</p>
          <p><strong>Bons estudos! 📖</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2025 EduLink - Conectando Alunos e Tutores</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"EduLink" <${EMAIL_USER}>`,
    subject: `📚 Aula Agendada: ${meetingData.title} - ${formattedDate} às ${formattedTime}`,
    html: emailHtml
  };

  try {
    // Send emails to both participants
    const emailPromises = [
      emailTransporter.sendMail({ ...mailOptions, to: hostEmail }),
      emailTransporter.sendMail({ ...mailOptions, to: guestEmail })
    ];

    await Promise.all(emailPromises);
    console.log(`✅ Emails sent to ${hostEmail} and ${guestEmail}`);
  } catch (error) {
    console.error('❌ Error sending emails:', error.message);
    throw new Error('Failed to send notification emails');
  }
}

// API Routes

/**
 * Main endpoint to create Zoom meeting and send emails
 */
app.post('/api/create-meeting', async (req, res) => {
  try {
    const { title, host, guest, start_time, duration } = req.body;

    // Validate required fields
    if (!title || !host || !guest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Campos obrigatórios em falta: título, professor, aluno' 
      });
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(host) || !emailRegex.test(guest)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    console.log(`🚀 Creating meeting: ${title} for ${host} and ${guest}`);

    // Step 1: Get Zoom access token
    const accessToken = await getZoomAccessToken();

    // Step 2: Create Zoom meeting
    const meetingData = { 
      title, 
      start_time: start_time || new Date().toISOString(), 
      duration: duration || 60 
    };
    const zoomMeeting = await createZoomMeeting(accessToken, meetingData);

    // Step 3: Send email notifications
    await sendMeetingEmails(host, guest, meetingData, zoomMeeting);

    // Step 4: Return success response
    res.json({
      success: true,
      message: 'Reunião criada e emails enviados com sucesso!',
      join_url: zoomMeeting.join_url,
      meeting_id: zoomMeeting.id,
      start_time: zoomMeeting.start_time,
      duration: zoomMeeting.duration
    });

    console.log(`✅ Meeting created successfully: ${zoomMeeting.id}`);

  } catch (error) {
    console.error('❌ Error in create-meeting endpoint:', error.message);
    
    // Return appropriate error message
    let errorMessage = 'Erro interno do servidor';
    if (error.message.includes('authenticate')) {
      errorMessage = 'Erro de autenticação com Zoom API';
    } else if (error.message.includes('meeting')) {
      errorMessage = 'Erro ao criar reunião Zoom';
    } else if (error.message.includes('email')) {
      errorMessage = 'Erro ao enviar emails de notificação';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'EduLink Zoom Integration'
  });
});

/**
 * Test endpoint for checking configuration
 */
app.get('/api/test-config', (req, res) => {
  const config = {
    zoom_configured: !!(ZOOM_CLIENT_ID && ZOOM_CLIENT_SECRET && ZOOM_ACCOUNT_ID),
    email_configured: !!(EMAIL_USER && EMAIL_PASS),
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(config);
});

/**
 * Serve the main HTML file
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Handle 404 errors
 */
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint não encontrado' 
  });
});

/**
 * Global error handler
 */
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Erro interno do servidor' 
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 EduLink Server Started!');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Visit http://localhost:${PORT} to view your application`);
  console.log('📧 Email configured:', !!(EMAIL_USER && EMAIL_PASS));
  console.log('🎥 Zoom configured:', !!(ZOOM_CLIENT_ID && ZOOM_CLIENT_SECRET && ZOOM_ACCOUNT_ID));
});

module.exports = app;