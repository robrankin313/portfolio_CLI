import Portfolio from "@/components/Portfolio";
import { education, profile } from "@/data/profile";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: profile.location },
  sameAs: [profile.linkedin, ...profile.extraLinks.map((l) => l.href)],
  alumniOf: { "@type": "CollegeOrUniversity", name: education.school },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <Portfolio />
    </>
  );
}
