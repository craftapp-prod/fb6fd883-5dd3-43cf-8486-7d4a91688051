import Link from "next/link";
import { FiBookOpen, FiCalendar, FiUsers, FiBarChart2, FiMessageSquare, FiDollarSign, FiFileText, FiSettings, FiBell, FiBook, FiUserCheck, FiClock, FiAward } from "react-icons/fi";
import "./page.css";
const features = [{
  icon: FiBookOpen,
  title: "Course Management",
  description: "Comprehensive tools for creating, managing, and tracking courses across all departments and grade levels."
}, {
  icon: FiCalendar,
  title: "Scheduling System",
  description: "Advanced scheduling tools for classes, exams, and school events with conflict detection and optimization."
}, {
  icon: FiUsers,
  title: "User Management",
  description: "Complete system for managing students, teachers, staff, and parents with role-based access control."
}, {
  icon: FiBarChart2,
  title: "Analytics Dashboard",
  description: "Powerful data visualization and reporting tools to track school performance and identify trends."
}, {
  icon: FiMessageSquare,
  title: "Communication Hub",
  description: "Integrated messaging system for seamless communication between teachers, students, and parents."
}, {
  icon: FiDollarSign,
  title: "Financial Management",
  description: "Comprehensive tools for tuition management, fee tracking, and financial reporting."
}];
const keyBenefits = [{
  icon: FiFileText,
  title: "Streamlined Administration",
  description: "Reduce paperwork and automate routine tasks to save time and resources."
}, {
  icon: FiSettings,
  title: "Customizable Workflows",
  description: "Tailor the system to match your school's unique processes and requirements."
}, {
  icon: FiBell,
  title: "Real-time Notifications",
  description: "Instant alerts for important events, deadlines, and updates."
}, {
  icon: FiBook,
  title: "Curriculum Management",
  description: "Tools for developing, organizing, and updating academic curricula."
}, {
  icon: FiUserCheck,
  title: "Attendance Tracking",
  description: "Comprehensive attendance monitoring with reporting and analytics."
}, {
  icon: FiClock,
  title: "Time Management",
  description: "Tools to optimize schedules and improve time utilization across the institution."
}];
const testimonials = [{
  quote: "EduAdmin has transformed how we manage our school operations. The time savings alone have been worth the investment.",
  author: "Sarah Johnson",
  role: "Principal, Lincoln High School",
  image: "https://images.unsplash.com/photo-1748261595246-5516b94b2dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MzAxMzF8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTkwNTM4ODR8&ixlib=rb-4.1.0&q=80&w=1080",
  alt: "Sarah Johnson, Principal"
}, {
  quote: "As a teacher, I love how EduAdmin simplifies grading and communication with students and parents.",
  author: "Michael Chen",
  role: "Science Teacher, Roosevelt Middle School",
  image: "https://images.unsplash.com/photo-1708182325463-a2ad1fcbf42d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MzAxMzF8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTkwNTM4ODN8&ixlib=rb-4.1.0&q=80&w=1080",
  alt: "Michael Chen, Science Teacher"
}, {
  quote: "The parent portal gives me better insight into my child's progress than any other system we've used.",
  author: "Emily Rodriguez",
  role: "Parent",
  image: "https://images.unsplash.com/photo-1619381690943-0b64a5607732?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MzAxMzF8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTkwNTM4ODN8&ixlib=rb-4.1.0&q=80&w=1080",
  alt: "Emily Rodriguez, Parent"
}];
export default function Home() {
  return <div className="flex flex-col items-center" data-path="frontend/src/app/page.tsx" id="el_d6e32a49">

      <section className="w-full py-12 md:py-24 text-center bg-gradient-to-r from-primary-50 to-primary-100" data-path="frontend/src/app/page.tsx" id="el_30eb220b">

        <div className="container px-4 md:px-6" data-path="frontend/src/app/page.tsx" id="el_6500cef7">

          <div className="flex flex-col items-center space-y-6 text-center" data-path="frontend/src/app/page.tsx" id="el_ffc36494">

            <div className="space-y-4" data-path="frontend/src/app/page.tsx" id="el_7f404188">

              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary-900" data-path="frontend/src/app/page.tsx" id="el_674131e8">
                Transform Your School Administration
              </h1>

              <p className="mx-auto max-w-[800px] text-gray-700 md:text-xl" data-path="frontend/src/app/page.tsx" id="el_6140d911">
                EduAdmin is the comprehensive school management solution that streamlines operations, enhances communication, and provides powerful analytics for educational institutions of all sizes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center" data-path="frontend/src/app/page.tsx" id="el_1e33d9c2">

              <Link href="/demo" className="rounded-xl shadow-lg max-h-[400px] object-cover selected-element" data-path="frontend/src/app/page.tsx" id="el_3428f272" src="https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D">
                Request Demo
              </Link>

              <Link href="/features" className="rounded-xl shadow-lg max-h-[400px] object-cover selected-element" data-path="frontend/src/app/page.tsx" id="el_2e21a8a0" src="https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D">
                Learn More
              </Link>
            </div>

            <div className="mt-8" data-path="frontend/src/app/page.tsx" id="el_627a8a7c"><img src="https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="EduAdmin dashboard showing school management features" className="rounded-xl shadow-lg max-h-[400px] object-cover selected-element" data-path="frontend/src/app/page.tsx" id="el_4045dd0e" />
          </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-white" data-path="frontend/src/app/page.tsx" id="el_90217807">

        <div className="container px-4 md:px-6" data-path="frontend/src/app/page.tsx" id="el_f851235b">

          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center space-y-4 text-center" data-path="frontend/src/app/page.tsx" id="el_c1c032ff">

            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary-800" data-path="frontend/src/app/page.tsx" id="el_89905b84">
              Comprehensive School Management
            </h2>

            <p className="max-w-[85%] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed" data-path="frontend/src/app/page.tsx" id="el_fcbabc16">
              EduAdmin provides all the tools you need to efficiently manage your educational institution.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3" data-path="frontend/src/app/page.tsx" id="el_cbebd450">
            {features.map((feature, index) => <div key={index} className="flex flex-col items-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md" data-path="frontend/src/app/page.tsx">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100" data-path="frontend/src/app/page.tsx">

                  <feature.icon className="h-6 w-6 text-primary-600" data-path="frontend/src/app/page.tsx" />
                </div>

                <h3 className="text-xl font-bold text-gray-900" data-path="frontend/src/app/page.tsx">{feature.title}</h3>

                <p className="text-gray-600" data-path="frontend/src/app/page.tsx">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-gray-50" data-path="frontend/src/app/page.tsx" id="el_e47f2d9d">

        <div className="container px-4 md:px-6" data-path="frontend/src/app/page.tsx" id="el_de5edf77">

          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center space-y-4 text-center" data-path="frontend/src/app/page.tsx" id="el_ac42b291">

            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary-800" data-path="frontend/src/app/page.tsx" id="el_8c115e1a">
              Key Benefits
            </h2>

            <p className="max-w-[85%] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed" data-path="frontend/src/app/page.tsx" id="el_a5ae57d9">
              Discover how EduAdmin can transform your school's administrative processes.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3" data-path="frontend/src/app/page.tsx" id="el_03835c85">
            {keyBenefits.map((benefit, index) => <div key={index} className="flex flex-col items-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md" data-path="frontend/src/app/page.tsx">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100" data-path="frontend/src/app/page.tsx">

                  <benefit.icon className="h-6 w-6 text-primary-600" data-path="frontend/src/app/page.tsx" />
                </div>

                <h3 className="text-xl font-bold text-gray-900" data-path="frontend/src/app/page.tsx">{benefit.title}</h3>

                <p className="text-gray-600" data-path="frontend/src/app/page.tsx">{benefit.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-white" data-path="frontend/src/app/page.tsx" id="el_340019fe">

        <div className="container px-4 md:px-6" data-path="frontend/src/app/page.tsx" id="el_08ca3978">

          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center space-y-4 text-center" data-path="frontend/src/app/page.tsx" id="el_68a29310">

            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary-800" data-path="frontend/src/app/page.tsx" id="el_5ecf08dc">
              What Our Users Say
            </h2>

            <p className="max-w-[85%] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed" data-path="frontend/src/app/page.tsx" id="el_b0903319">
              Hear from educators and administrators who use EduAdmin every day.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 py-12 lg:grid-cols-3" data-path="frontend/src/app/page.tsx" id="el_4c89be98">
            {testimonials.map((testimonial, index) => <div key={index} className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm" data-path="frontend/src/app/page.tsx">

                <div className="flex items-center gap-4" data-path="frontend/src/app/page.tsx">

                  <img src={testimonial.image} alt={testimonial.alt} className="h-12 w-12 rounded-full object-cover" data-path="frontend/src/app/page.tsx" />

                  <div data-path="frontend/src/app/page.tsx">

                    <h4 className="font-semibold" data-path="frontend/src/app/page.tsx">{testimonial.author}</h4>

                    <p className="text-sm text-gray-600" data-path="frontend/src/app/page.tsx">{testimonial.role}</p>
                  </div>
                </div>

                <p className="mt-4 text-gray-700 italic" data-path="frontend/src/app/page.tsx">"{testimonial.quote}"</p>
              </div>)}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-primary-50" data-path="frontend/src/app/page.tsx" id="el_dafc4127">

        <div className="container px-4 md:px-6" data-path="frontend/src/app/page.tsx" id="el_6db28d47">

          <div className="mx-auto max-w-[58rem] flex flex-col items-center justify-center space-y-6 text-center" data-path="frontend/src/app/page.tsx" id="el_260b4c16">

            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary-800" data-path="frontend/src/app/page.tsx" id="el_9b105318">
              Ready to Transform Your School?
            </h2>

            <p className="max-w-[85%] text-gray-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed" data-path="frontend/src/app/page.tsx" id="el_6ad831b2">
              Join hundreds of educational institutions that have streamlined their operations with EduAdmin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center" data-path="frontend/src/app/page.tsx" id="el_c43d8dd0">

              <Link href="/register" className="inline-flex h-11 items-center justify-center rounded-md bg-primary-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" data-path="frontend/src/app/page.tsx" id="el_facb39ae">
                Get Started
              </Link>

              <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-md border border-gray-300 bg-white px-8 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500" data-path="frontend/src/app/page.tsx" id="el_2bd91d12">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>;
}