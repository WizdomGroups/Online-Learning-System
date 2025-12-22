import { Tag } from "antd";

<section>
  <h3 className="text-lg font-semibold text-gray-900">Status</h3>
  {document.status && (
    <Tag 
      color={
        document.status === "active" ? "green" :
        document.status === "inactive" ? "gold" :
        document.status === "Pending" ? "purple" : "gray"
      } 
      className="px-3 py-1 rounded-full capitalize"
    >
      {document.status}
    </Tag>
  )}
</section>

<section>
  <h3 className="text-lg font-semibold text-gray-900">Security Type</h3>
  {document.securityType?.name && (
    <Tag 
      color={
        document.securityType.name === "High" ? "green" :
        document.securityType.name === "Medium" ? "gold" :
        document.securityType.name === "Low" ? "red" : "default"
      } 
      className="px-3 py-1 rounded-full capitalize"
    >
      {document.securityType.name}
    </Tag>
  )}
</section> 