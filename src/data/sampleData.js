// Sample webhook payloads for testing
export const sampleWebhookPayloads = [
  {
    object: 'whatsapp_business_account',
    entry: [{
      id: '102290129340398',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15550100001',
            phone_number_id: '106540352242922'
          },
          contacts: [{
            profile: {
              name: 'John Doe'
            },
            wa_id: '14155238886'
          }],
          messages: [{
            from: '14155238886',
            id: 'wamid.HBgLMTQxNTUyMzg4ODYVAgASGBQzQTdBNURDODY4Q0E1M0VGM0Y0QUU',
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: {
              body: 'Hello! I need help with my order.'
            },
            type: 'text'
          }]
        },
        field: 'messages'
      }]
    }]
  },
  {
    object: 'whatsapp_business_account',
    entry: [{
      id: '102290129340398',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15550100001',
            phone_number_id: '106540352242922'
          },
          contacts: [{
            profile: {
              name: 'Sarah Smith'
            },
            wa_id: '14155238887'
          }],
          messages: [{
            from: '14155238887',
            id: 'wamid.HBgLMTQxNTUyMzg4ODcVAgASGBQzQTdBNURDODY4Q0E1M0VGM0Y0QUY',
            timestamp: Math.floor(Date.now() / 1000 - 300).toString(),
            text: {
              body: 'Is my package ready for pickup?'
            },
            type: 'text'
          }]
        },
        field: 'messages'
      }]
    }]
  }
];

// Function to seed database with sample data
export const seedDatabase = async () => {
  try {
    for (const payload of sampleWebhookPayloads) {
      const response = await fetch('http://localhost:3001/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        console.log('Sample data seeded successfully');
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};