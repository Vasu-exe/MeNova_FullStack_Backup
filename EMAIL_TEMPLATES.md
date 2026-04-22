# MeNova Health - Email Templates for Follow-Up Verification

---

## Email 1: For Existing Patients (Qualified for Follow-Up)

**Subject:** Your Follow-Up Appointment Link

**Body:**

```
Hi {{firstName}},

Great! We found your consultation in our records. You're ready to schedule your follow-up appointment.

Click below to book:

[SCHEDULE FOLLOW-UP]
https://cal.com/menova/30min

Questions? Reply to this email.

Best,
MeNova Health Team
```

---

## Email 2: For New Patients (Not Qualified)

**Subject:** Book Your Initial Consultation

**Body:**

```
Hi {{firstName}},

We didn't find a previous consultation with {{email}} in our records. 

To get started, please book your initial consultation first:

[BOOK INITIAL CONSULTATION]
https://cal.com/menova/initial-consult

After your first visit, you can schedule follow-ups anytime.

Questions? Reply to this email.

Best,
MeNova Health Team
```

---

## How to Use in Make.com

1. After webhook receives form data → Search Google Sheets for email
2. **IF found** → Send Email 1 with follow-up link
3. **IF not found** → Send Email 2 with initial consult link
4. Replace placeholder links with your actual Cal.com URLs
5. Replace `{{firstName}}` and `{{email}}` with webhook data

Done!
