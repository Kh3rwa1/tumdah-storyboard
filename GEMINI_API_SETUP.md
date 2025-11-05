# Google AI Studio API Key Setup

## The Problem

You're getting this error:
```
API keys are not supported by this API. Expected OAuth2 access token
```

This means you're using a **Vertex AI** key, but the code needs a **Google AI Studio (Gemini)** API key.

## The Solution

### Option 1: Use Google AI Studio (FREE & EASY) ✅ RECOMMENDED

Google AI Studio provides a **free tier** with API keys that work directly.

#### Steps:

1. **Go to Google AI Studio**
   - Visit: https://aistudio.google.com/app/apikey

2. **Create API Key**
   - Click "Create API Key"
   - Choose "Create API key in new project" (or select existing)
   - Copy the key (starts with `AIza...`)

3. **Set the API Key as Secret**
   - In your Bolt.new/Supabase dashboard, go to Edge Functions settings
   - Add a secret named: `GEMINI_API_KEY`
   - Paste your API key value

4. **Test**
   - The edge function will automatically use this key
   - No code changes needed!

#### Free Tier Limits:
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per day
- Perfect for development and testing!

---

### Option 2: Use Vertex AI (Requires GCP Setup)

If you want to use Vertex AI instead, you need:

1. **GCP Project with Vertex AI enabled**
2. **Service Account with proper permissions**
3. **Service Account JSON key**
4. **Code changes to handle OAuth2 authentication**

This is more complex and typically used for production with billing enabled.

---

## Quick Reference

### What You're Using Now (WRONG):
- ❌ Vertex AI credentials
- ❌ Endpoint: `generativelanguage.googleapis.com` with OAuth2
- ❌ Requires service account and complex auth

### What You Need (CORRECT):
- ✅ Google AI Studio API key
- ✅ Same endpoint but with API key authentication
- ✅ Simple, free, works immediately

---

## How to Check Your Key Type

**Vertex AI key**: Looks like a JSON file with service account credentials
**Google AI Studio key**: Simple string starting with `AIza...`

If you have a JSON file → You're using Vertex AI (wrong for this setup)
If you have `AIza...` string → You're using Google AI Studio (correct!)

---

## Need Help?

1. Character save error is now fixed (storage bucket auto-creates)
2. For API key: Use Google AI Studio, not Vertex AI
3. Get your free key: https://aistudio.google.com/app/apikey
