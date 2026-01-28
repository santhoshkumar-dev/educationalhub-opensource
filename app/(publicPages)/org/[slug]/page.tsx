"use client";
import { useOrg } from "./OrgContext";

export default function OrganizationPage() {
  const { organization } = useOrg();

  return (
    <section className="p-8">
      <h1 className="text-2xl md:text-4xl">About</h1>

      <div className="my-4 gap-4">
        <h2 className="text-xl md:text-2xl">{organization?.name}</h2>
        <div
          className="my-4"
          dangerouslySetInnerHTML={{
            __html: organization?.htmlDescription || "",
          }}
        />
      </div>
    </section>
  );
}
