import {
  BuildingIcon,
  CalendarIcon,
  ExternalLinkIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@nuvui/icons";
import { Badge, Button, Separator } from "@nuvui/react";
import type { ComponentType } from "react";
import { formatDayAndTime, hostOf } from "web/lib/format";
import {
  companyKindLabels,
  providerIntent,
  providerLabels,
} from "web/lib/labels";
import type { Contact } from "web/lib/types";

/**
 * What's known about one contact. Shared by the full page and the sheet
 * that opens over the list, so both say the same thing.
 */
export function ContactDetails({ contact }: { contact: Contact }) {
  const rows: {
    Icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
    label: string;
    value: React.ReactNode;
  }[] = [
    { Icon: MailIcon, label: "Email", value: contact.email },
    { Icon: PhoneIcon, label: "Phone", value: contact.phone },
    {
      Icon: BuildingIcon,
      label: "Company",
      value: `${contact.company} · ${companyKindLabels[contact.companyKind]}`,
    },
    { Icon: MapPinIcon, label: "Address", value: contact.address },
    { Icon: GlobeIcon, label: "Website", value: hostOf(contact.website) },
    {
      Icon: CalendarIcon,
      label: "Joined",
      value: (
        <time dateTime={contact.createdAt}>
          {formatDayAndTime.format(new Date(contact.createdAt))} UTC
        </time>
      ),
    },
  ];

  return (
    <div className="contact-details">
      <div className="contact-details__actions">
        <Button asChild intent="primary" size="sm">
          <a href={`mailto:${contact.email}`}>
            <MailIcon size={16} aria-hidden="true" />
            Email
          </a>
        </Button>
        <Button asChild intent="secondary" size="sm">
          <a href={`tel:${contact.phone.replace(/\s*x\d+$/, "")}`}>
            <PhoneIcon size={16} aria-hidden="true" />
            Call
          </a>
        </Button>
        <Button asChild intent="secondary" size="sm">
          <a href={contact.website} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon size={16} aria-hidden="true" />
            Website
          </a>
        </Button>
      </div>
      <Separator />
      <dl className="contact-details__list">
        {rows.map(({ Icon, label, value }) => (
          <div key={label} className="contact-details__row">
            <dt>
              <Icon size={16} aria-hidden={true} /> {label}
            </dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <Separator />
      <p className="contact-details__meta">
        <Badge intent={providerIntent[contact.provider]} variant="outline">
          {providerLabels[contact.provider]}
        </Badge>
        <span className="contact-details__id">ID {contact.id}</span>
      </p>
    </div>
  );
}
