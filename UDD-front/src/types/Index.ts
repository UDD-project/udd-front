export type Index = {
  id: string;
  filename: string;
  employeeName: string;
  organizationName: string;
  affectedOrganizationName: string;
  incidentSeverity: string;
  location: {
    lat: number;
    lon: number;
  };
  incidentDescriptionSr: string;
  incidentDescriptionEn: string;
};
