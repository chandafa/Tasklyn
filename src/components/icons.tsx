import type { SVGProps } from 'react';
import { 
  Home, 
  BarChart, 
  LineChart, 
  Wallet, 
  Settings, 
  ListTodo,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Loader2,
  Megaphone,
  Lightbulb,
  BrainCircuit,
  ListChecks,
  Plane,
  Tags,
  Truck,
  BookOpen,
  Video,
  RefreshCw,
  User,
  CalendarDays,
  Info
} from 'lucide-react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      // ... (logo path remains the same)
    >
      <rect width="256" height="256" fill="none"/>
      <path d="M71,111.45,44.24,36.83A8,8,0,0,1,51,24H205a8,8,0,0,1,6.79,12.83L185,111.45A32,32,0,0,0,158.45,136h-60.9A32,32,0,0,0,71,111.45Z" opacity="0.2"/>
      <path d="M229.41,68.3,205,24H51a8,8,0,0,0-6.79,12.83L71,111.45a32,32,0,0,1,26.55,24.55h60.9A32,32,0,0,1,185,111.45L211.76,36.83A8,8,0,0,0,222.17,24a8,8,0,0,0-5.83,2.59L192,48l-24.59-21.41a8,8,0,0,0-10.82,11.62L176,64,151.41,42.59a8,8,0,0,0-10.82,11.62L160,80,135.41,58.59a8,8,0,0,0-10.82,11.62L144,96,119.41,74.59a8,8,0,1,0-10.82,11.62L128,112H104a8,8,0,0,0,0,16h24l-19.41,22.59a8,8,0,0,0,5.41,13.41A8,8,0,0,0,120,160l24.59-21.41a8,8,0,0,0,0-11.62L128,112h24a8,8,0,0,0,0-16H128l19.41-22.59a8,8,0,1,0-10.82-11.62L120,80,95.41,58.59a8,8,0,1,0-10.82,11.62L104,96,79.41,74.59a8,8,0,0,0-10.82,11.62L88,112,63.41,90.59A8,8,0,0,0,49.41,96a8,8,0,0,0,5.41,13.41,8.08,8.08,0,0,0,5.41-2.59L80,88l19.41,22.59a8,8,0,0,0,10.82-11.62L96,80,71.41,58.59a8,8,0,1,0-10.82,11.62L80,96,55.41,74.59A8,8,0,0,0,41.41,80a8,8,0,0,0,5.41,13.41,8.08,8.08,0,0,0,5.41-2.59L72,72,52.24,36.83" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <line x1="160" y1="168" x2="160" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <line x1="128" y1="168" x2="128" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <line x1="96" y1="168" x2="96" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </svg>
  ),
  google: (props: SVGProps<SVGSVGElement>) => (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 48 48" 
      width="48px" 
      height="48px"
    >
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.449-11.275-8.118l-6.524,5.023C9.507,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.712,34.464,44,28.756,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  ),
  spinner: Loader2,
  home: Home,
  stats: BarChart,
  chart: LineChart,
  wallet: Wallet,
  settings: Settings,
  tasks: ListTodo,
  completed: CheckCircle,
  upcoming: Clock,
  overdue: AlertTriangle,
  reports: FileText,
  collab: Users,
  marketing: Megaphone,
  idea: Lightbulb,
  kognitif: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.6667 4.66667H3.33333C2.59695 4.66667 2 5.26362 2 6V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V6C14 5.26362 13.403 4.66667 12.6667 4.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.33333 4.66667V3.33333C5.33333 2.59695 5.93028 2 6.66667 2H9.33333C10.0697 2 10.6667 2.59695 10.6667 3.33333V4.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  dosen: User,
  jadwal: CalendarDays,
  info: Info,
  refresh: RefreshCw,
};
