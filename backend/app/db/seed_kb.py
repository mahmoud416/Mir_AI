"""
MIR Backend — Knowledge Base Seed Data
Seeds official Microsoft documentation articles into MongoDB Atlas if empty.
"""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

from app.db.database import get_db
from app.models.documents import KBDocument, KBSource

logger = logging.getLogger(__name__)

OFFICIAL_KB_ARTICLES = [
    KBDocument(
        id=str(uuid.uuid4()),
        title="Reset a Personal Microsoft Account Password | إعادة تعيين كلمة مرور حساب مايكروسوفت الشخصي",
        content=(
            "Official Microsoft Password Reset Guide:\n\n"
            "1. Go to the official Reset Password page: https://account.live.com/password/reset\n"
            "2. Enter the email address, phone number, or Skype name associated with your account.\n"
            "3. Select where you would like to receive your security verification code (email or SMS).\n"
            "4. Enter the verification code received and choose a new, strong password.\n\n"
            "خطوات إعادة تعيين كلمة مرور الحساب الشخصي:\n"
            "1. توجه للرابط الرسمي: https://account.live.com/password/reset\n"
            "2. أدخل البريد الإلكتروني أو رقم الهاتف أو اسم Skype.\n"
            "3. اختر وسيلة استلام رمز التحقق (بريد بديل أو رسالة نصية).\n"
            "4. أدخل الرمز واختر كلمة مرور قوية جديدة."
        ),
        category="password_reset",
        language="en",
        tags=["password", "reset", "microsoft", "كلمة_المرور", "حساب_شخصي"],
        source=KBSource.microsoft_docs,
        source_url="https://account.live.com/password/reset",
        is_verified=True,
    ),
    KBDocument(
        id=str(uuid.uuid4()),
        title="Self-Service Password Reset (SSPR) for Work & School Accounts | بوابة الخدمة الذاتية SSPR لحسابات العمل والدراسة",
        content=(
            "Work and school accounts managed under Microsoft Entra ID (Azure AD) use Self-Service Password Reset (SSPR):\n\n"
            "1. Navigate to: https://aka.ms/sspr\n"
            "2. Enter your work/school User ID (e.g., user@company.com) and complete the CAPTCHA.\n"
            "3. Verify your identity using your configured authentication methods (Authenticator app, phone SMS, or office phone).\n"
            "4. Enter your new password meeting your organization's complexity policy.\n"
            "Note: If SSPR is not enabled by your company administrator, contact your internal IT Helpdesk.\n\n"
            "خطوات الخدمة الذاتية لحسابات العمل والمؤسسات:\n"
            "1. افتح الرابط: https://aka.ms/sspr\n"
            "2. أدخل معرف المستخدم المؤسسي ورمز التحقق.\n"
            "3. أكد هويتك باستخدام تطبيق Authenticator أو رسالة SMS.\n"
            "4. أدخل كلمة المرور الجديدة وفق شروط الأمان الخاصة بالمؤسسة."
        ),
        category="password_reset",
        language="en",
        tags=["sspr", "work_school", "azure_ad", "entra_id", "عمل", "مؤسسة"],
        source=KBSource.microsoft_docs,
        source_url="https://aka.ms/sspr",
        is_verified=True,
    ),
    KBDocument(
        id=str(uuid.uuid4()),
        title="Microsoft Account Locked or Suspended | حل مشكلة الحساب المقفل أو المعلق",
        content=(
            "When a Microsoft account is locked due to unusual activity or repeated failed login attempts:\n\n"
            "1. Visit the Microsoft Account Unlock portal: https://account.live.com\n"
            "2. Sign in and follow the prompts to enter a security phone number to receive a security code via SMS.\n"
            "3. Any mobile number capable of receiving SMS can be used for verification (it does not need to be the account's registered phone).\n"
            "4. For domain/work accounts locked by Active Directory, accounts usually unlock automatically after 15–30 minutes, or require Domain Admin assistance.\n\n"
            "حل مشكلة الحساب المقفل:\n"
            "1. ادخل إلى: https://account.live.com\n"
            "2. اتبع التعليمات لإدخال أي رقم هاتف يمكنه استقبال رسالة نصية قصيرة SMS.\n"
            "3. أدخل الرمز لفك قفل الحساب.\n"
            "4. لحسابات الدومين والعمل، يتم فك القفل تلقائياً بعد 15-30 دقيقة حسب سياسة الشركة أو عبر مسؤول النظام."
        ),
        category="account_locked",
        language="en",
        tags=["locked", "account_locked", "blocked", "حساب_مقفل", "فك_القفل"],
        source=KBSource.microsoft_docs,
        source_url="https://support.microsoft.com/account-billing/account-has-been-locked-805e8b0d-4141-29b2-7b65-df6ff6d9ce27",
        is_verified=True,
    ),
    KBDocument(
        id=str(uuid.uuid4()),
        title="Troubleshooting Microsoft Authenticator and MFA | استكشاف أخطاء تطبيق Authenticator والمصادقة الثنائية",
        content=(
            "Resolving Multi-Factor Authentication (MFA) issues:\n\n"
            "1. Time Synchronization: Open Microsoft Authenticator > Settings > Time Sync / Device Time. Ensure your mobile device clock is set to Automatic.\n"
            "2. Notifications Not Arriving: Open Authenticator and manually check for pending approval requests, or use the 6-digit one-time code.\n"
            "3. Re-registering MFA: Visit https://mysignins.microsoft.com/security-info from an already authenticated session to add a backup phone or method.\n"
            "4. If you lost your device and have no backup method, your organization's IT Admin must generate a Temporary Access Pass (TAP).\n\n"
            "حلول مشاكل المصادقة الثنائية:\n"
            "1. ضبط الوقت: تأكد من تفعيل الوقت التلقائي في الهاتف وتطبيق Authenticator.\n"
            "2. في حال عدم وصول الإشعار: افتح التطبيق مباشرة واستخدم الرمز المكون من 6 أرقام.\n"
            "3. لتسجيل وسيلة جديدة: ادخل على https://mysignins.microsoft.com/security-info\n"
            "4. إذا فقدت جهازك، تواصل مع الدعم لإنشاء تصريح وصول مؤقت (TAP)."
        ),
        category="mfa",
        language="en",
        tags=["mfa", "authenticator", "2fa", "security_info", "المصادقة", "تحقق"],
        source=KBSource.microsoft_docs,
        source_url="https://mysignins.microsoft.com/security-info",
        is_verified=True,
    ),
    KBDocument(
        id=str(uuid.uuid4()),
        title="Troubleshooting Windows 10/11 Sign-In | حل مشاكل تسجيل الدخول إلى Windows",
        content=(
            "Windows Sign-In basic user troubleshooting steps:\n\n"
            "1. PIN or Windows Hello errors: On the lock screen, click 'Sign-in options' and choose the key icon to log in using your Password.\n"
            "2. Network check: Ensure your network cable (Ethernet) or Wi-Fi is connected, then restart your PC.\n"
            "3. Keyboard layout: Verify Caps Lock is OFF and check your keyboard language.\n"
            "4. Domain or Admin errors: If Windows displays a domain trust error or asks for Administrator credentials, this requires IT Helpdesk permissions — request a support ticket so IT can resolve it for you.\n\n"
            "خطوات استكشاف أخطاء تسجيل الدخول إلى ويندوز للمستخدمين:\n"
            "1. مشاكل الـ PIN أو البصمة: في شاشة القفل، اضغط على 'خيارات تسجيل الدخول (Sign-in options)' واختر رمز المفتاح لتسجيل الدخول بكلمة المرور.\n"
            "2. فحص الشبكة: تأكد من اتصال كابل الإنترنت أو الواي فاي، ثم أعد تشغيل الجهاز.\n"
            "3. لغة الكيبورد: تأكد من إيقاف زر Caps Lock والتأكد من لغة الكتابة الصحيحة.\n"
            "4. أخطاء الدومين وصلاحيات المسؤول: إذا ظهرت رسالة خطأ في الدومين أو طلب حساب Administrator، فهذا يتطلب صلاحيات قسم الـ IT — اطلب فتح تذكرة دعم فني ليقوم مهندس الدعم بحلها فوراً."
        ),
        category="windows",
        language="en",
        tags=["windows", "pin", "login", "تسجيل_الدخول", "ويندوز"],
        source=KBSource.microsoft_docs,
        source_url="https://support.microsoft.com/windows/troubleshoot-problems-signing-in-to-windows-298cfd5f-df10-c634-d7c7-e30206e858b2",
        is_verified=True,
    ),
]


async def seed_knowledge_base_if_empty() -> None:
    """Inserts official Microsoft knowledge base records if the collection is empty."""
    db = get_db()
    count = await db.knowledge_base.count_documents({})
    if count == 0:
        logger.info("Seeding official Microsoft documentation into knowledge_base...")
        for doc in OFFICIAL_KB_ARTICLES:
            await db.knowledge_base.insert_one(doc.model_dump())
        logger.info("Seeded %d official KB articles.", len(OFFICIAL_KB_ARTICLES))
    else:
        logger.info("knowledge_base already contains %d records — skipping seed.", count)
