import { useLocalSearchParams } from "expo-router";
import { ListingWizard } from "@/components/listing/ListingWizard";

export default function EditListing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ListingWizard editId={id} />;
}
