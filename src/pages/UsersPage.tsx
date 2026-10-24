import React from 'react';
import { Users, UserPlus, ShieldCheck, Mail, MoreVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoBanner } from '../components/ui/DemoBanner';

const DEMO_USERS = [
  {
    id: 'u1',
    nameAr: 'أحمد محمد',
    nameEn: 'Ahmed Mohamed',
    email: 'ahmed.m@company.com',
    roleAr: 'أخصائي دعم',
    roleEn: 'Support Agent',
    statusAr: 'نشط',
    statusEn: 'Active',
    conversations: 28,
    resolved: 24,
  },
  {
    id: 'u2',
    nameAr: 'سارة العمري',
    nameEn: 'Sara Al-Omari',
    email: 'sara.a@company.com',
    roleAr: 'أخصائي دعم',
    roleEn: 'Support Agent',
    statusAr: 'نشط',
    statusEn: 'Active',
    conversations: 19,
    resolved: 17,
  },
  {
    id: 'u3',
    nameAr: 'محمود السيد',
    nameEn: 'Mahmoud Elsayed',
    email: 'mahmoud.s@company.com',
    roleAr: 'مدير النظام',
    roleEn: 'System Admin',
    statusAr: 'نشط',
    statusEn: 'Active',
    conversations: 45,
    resolved: 41,
  },
  {
    id: 'u4',
    nameAr: 'نورة الزهراني',
    nameEn: 'Noura Al-Zahrani',
    email: 'noura.z@company.com',
    roleAr: 'أخصائي دعم',
    roleEn: 'Support Agent',
    statusAr: 'غير نشط',
    statusEn: 'Inactive',
    conversations: 8,
    resolved: 6,
  },
];

export default function UsersPage() {
  const { isDemo, language, t } = useApp();
  const isEn = language === 'en';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('usersTitle')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('usersSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <DemoBanner />
          <button
            id="add-user-btn"
            className="btn-primary text-sm"
            title={isEn ? 'Requires admin permissions' : 'تتطلب صلاحية مسؤول'}
          >
            <UserPlus className="w-4 h-4" />
            {isEn ? 'Add User' : 'إضافة مستخدم'}
          </button>
        </div>
      </div>

      {/* Access note */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {isEn
            ? 'User access controls are enforced on the backend. Permissions cannot be modified directly in the frontend.'
            : 'صلاحيات هذه الصفحة مُقيَّدة بالواجهة الخلفية. لا يمكن تعديل الأدوار أو الصلاحيات من الواجهة الأمامية.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: isEn ? 'Total Users' : 'إجمالي المستخدمين',
            value: DEMO_USERS.length,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/30',
          },
          {
            label: isEn ? 'Active' : 'نشطون',
            value: DEMO_USERS.filter((u) => u.statusAr === 'نشط').length,
            icon: ShieldCheck,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-900/30',
          },
          {
            label: isEn ? 'Admins' : 'المسؤولون',
            value: DEMO_USERS.filter((u) => u.roleEn === 'System Admin').length,
            icon: ShieldCheck,
            color: 'text-purple-600',
            bg: 'bg-purple-50 dark:bg-purple-900/30',
          },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div
              className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full text-start">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {[
                isEn ? 'User' : 'المستخدم',
                isEn ? 'Role' : 'الدور',
                isEn ? 'Status' : 'الحالة',
                isEn ? 'Conversations' : 'المحادثات',
                isEn ? 'Resolved' : 'المحلولة',
                '',
              ].map((h, i) => (
                <th key={i} className="px-4 py-3 text-xs font-semibold text-slate-500 text-start">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900">
            {DEMO_USERS.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(isEn ? user.nameEn : user.nameAr).slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {isEn ? user.nameEn : user.nameAr}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      user.roleEn === 'System Admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isEn ? user.roleEn : user.roleAr}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      user.statusAr === 'نشط' ? 'badge-resolved' : 'badge-closed'
                    }`}
                  >
                    {isEn ? user.statusEn : user.statusAr}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {user.conversations}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{user.resolved}</span>
                    <div className="w-16 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${(user.resolved / user.conversations) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-end">
                  <button className="btn-ghost p-1" aria-label="options">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
