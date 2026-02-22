import { Faq, db, eq } from "astro:db";

type FaqItem = { category: string; question: string; answer: string };

const FAQS: FaqItem[] = [
  {
    category: "Publishing",
    question: "How do I publish my portfolio?",
    answer:
      "Create or update your portfolio content, then use the visibility controls and slug settings in the editor. Once enabled for public access, your portfolio can be opened with its public URL.",
  },
  {
    category: "Editing",
    question: "Can I update my portfolio after publishing?",
    answer:
      "Yes. You can edit content after publishing, and updates are reflected on your portfolio output once saved.",
  },
  {
    category: "Visibility",
    question: "Is my portfolio public?",
    answer:
      "You control visibility. Private portfolios stay internal, while public or unlisted visibility makes the portfolio accessible through its URL.",
  },
  {
    category: "Domains",
    question: "Can I use a custom domain?",
    answer:
      "Custom domain mapping is not part of the current Portfolio Creator V1 flow. Portfolios are served using the provided app URL structure.",
  },
  {
    category: "Media",
    question: "Can I upload images and media?",
    answer:
      "Yes. You can upload supported media assets for portfolio presentation and profile context within the editor workflow.",
  },
];

export default async function seedFaqContent() {
  await db.delete(Faq).where(eq(Faq.audience, "user"));

  await db.insert(Faq).values(
    FAQS.map((item, index) => ({
      audience: "user",
      category: item.category,
      question: item.question,
      answer_md: item.answer,
      sort_order: index + 1,
      is_published: true,
      created_at: new Date(),
      updated_at: new Date(),
    }))
  );

  console.log(`Seeded ${FAQS.length} production FAQs for portfolio-creator user audience.`);
}
