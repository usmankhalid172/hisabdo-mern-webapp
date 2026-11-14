import { createClient } from "@/lib/supabase/client";

export type CategoryRecord = {
  id: string;
  client_uuid: string;
  name: string;
  type: "receivable" | "payable";
  version: number;
  updated_at: string;
  deleted_at: string | null;
  metadata: Record<string, unknown>;
};

export type NoteRecord = {
  id: string;
  client_uuid: string;
  title: string;
  content: string;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type TaskRecord = {
  id: string;
  client_uuid: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  is_completed: number;
  customer_client_uuid: string | null;
  customer_remote_id: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type BusinessProfileRecord = {
  id: string;
  user_id: string;
  client_uuid: string | null;
  business_name: string;
  phone: string | null;
  email: string | null;
  metadata: Record<string, unknown>;
  version: number;
  updated_at: string;
  deleted_at: string | null;
};

export type AttachmentRecord = {
  id: string;
  client_uuid: string;
  user_id: string;
  bucket: string;
  path: string;
  mime_type: string | null;
  size: number | null;
  parent_type: string | null;
  parent_id: string | null;
  metadata: Record<string, unknown>;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

const uuid = () => crypto.randomUUID();
const active = (query: any) => query.is("deleted_at", null);

async function softDelete(table: string, userId: string, id: string): Promise<void> {
  const client = createClient();
  const { data: current, error: readError } = await client.from(table).select("version").eq("id", id).eq("user_id", userId).single();
  if (readError) throw readError;
  const { error } = await client.from(table).update({
    deleted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: Number(current.version || 1) + 1,
  }).eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export const mobileDataParityService = {
  async getCategories(userId: string): Promise<CategoryRecord[]> {
    const { data, error } = await active(createClient().from("categories").select("*").eq("user_id", userId)).order("name");
    if (error) throw error;
    return (data || []) as CategoryRecord[];
  },

  async saveCategory(userId: string, input: Pick<CategoryRecord, "name" | "type">, id?: string): Promise<CategoryRecord> {
    const client = createClient();
    const now = new Date().toISOString();
    const payload = { name: input.name.trim(), type: input.type, updated_at: now };
    let result;
    if (id) {
      const { data: current, error: readError } = await client.from("categories").select("version").eq("id", id).eq("user_id", userId).single();
      if (readError) throw readError;
      result = await client.from("categories").update({ ...payload, version: Number(current.version || 1) + 1 }).eq("id", id).eq("user_id", userId).select().single();
    } else {
      result = await client.from("categories").insert([{ ...payload, user_id: userId, client_uuid: uuid(), version: 1 }]).select().single();
    }
    if (result.error) throw result.error;
    return result.data as CategoryRecord;
  },

  async deleteCategory(userId: string, id: string): Promise<void> {
    await softDelete("categories", userId, id);
  },

  async getNotes(userId: string): Promise<NoteRecord[]> {
    const { data, error } = await active(createClient().from("notes").select("*").eq("user_id", userId)).order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []) as NoteRecord[];
  },

  async saveNote(userId: string, input: Pick<NoteRecord, "title" | "content">, id?: string): Promise<NoteRecord> {
    const client = createClient();
    const payload = { title: input.title.trim(), content: input.content, updated_at: new Date().toISOString() };
    let result;
    if (id) {
      const { data: current, error: readError } = await client.from("notes").select("version").eq("id", id).eq("user_id", userId).single();
      if (readError) throw readError;
      result = await client.from("notes").update({ ...payload, version: Number(current.version || 1) + 1 }).eq("id", id).eq("user_id", userId).select().single();
    } else {
      result = await client.from("notes").insert([{ ...payload, user_id: userId, client_uuid: uuid(), version: 1 }]).select().single();
    }
    if (result.error) throw result.error;
    return result.data as NoteRecord;
  },

  async deleteNote(userId: string, id: string): Promise<void> {
    await softDelete("notes", userId, id);
  },

  async getTasks(userId: string): Promise<TaskRecord[]> {
    const { data, error } = await active(createClient().from("tasks").select("*").eq("user_id", userId)).order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []) as TaskRecord[];
  },

  async saveTask(userId: string, input: Omit<TaskRecord, "id" | "client_uuid" | "user_id" | "version" | "created_at" | "updated_at" | "deleted_at"> & { customer_id?: string | null }, id?: string): Promise<TaskRecord> {
    const client = createClient();
    let customerClientUuid: string | null = input.customer_client_uuid;
    if (input.customer_id) {
      const { data: customer, error } = await client.from("customers").select("client_uuid").eq("id", input.customer_id).eq("user_id", userId).maybeSingle();
      if (error) throw error;
      customerClientUuid = customer?.client_uuid ?? null;
    }
    const payload = {
      title: input.title,
      description: input.description,
      due_date: input.due_date,
      status: input.status,
      priority: input.priority,
      customer_client_uuid: customerClientUuid,
      customer_remote_id: null,
      is_completed: input.status === "completed" ? 1 : 0,
      updated_at: new Date().toISOString(),
    };
    let result;
    if (id) {
      const { data: current, error: readError } = await client.from("tasks").select("version").eq("id", id).eq("user_id", userId).single();
      if (readError) throw readError;
      result = await client.from("tasks").update({ ...payload, version: Number(current.version || 1) + 1 }).eq("id", id).eq("user_id", userId).select().single();
    } else {
      result = await client.from("tasks").insert([{ ...payload, user_id: userId, client_uuid: uuid(), version: 1 }]).select().single();
    }
    if (result.error) throw result.error;
    return result.data as TaskRecord;
  },

  async deleteTask(userId: string, id: string): Promise<void> {
    await softDelete("tasks", userId, id);
  },

  async getBusinessProfile(userId: string): Promise<BusinessProfileRecord | null> {
    const { data, error } = await active(createClient().from("user_profiles").select("*").eq("user_id", userId)).maybeSingle();
    if (error) throw error;
    return data as BusinessProfileRecord | null;
  },

  async saveBusinessProfile(userId: string, input: { business_name: string; phone?: string; email?: string; metadata?: Record<string, unknown> }): Promise<BusinessProfileRecord> {
    const client = createClient();
    const existing = await this.getBusinessProfile(userId);
    const { data, error } = await client.from("user_profiles").upsert({
      ...(existing?.client_uuid ? { client_uuid: existing.client_uuid } : { client_uuid: uuid() }),
      user_id: userId,
      business_name: input.business_name.trim(),
      phone: input.phone || null,
      email: input.email || null,
      metadata: input.metadata || existing?.metadata || {},
      version: (existing?.version || 0) + 1,
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }, { onConflict: "user_id" }).select().single();
    if (error) throw error;
    return data as BusinessProfileRecord;
  },

  async getAttachments(userId: string, parentType?: string, parentId?: string): Promise<AttachmentRecord[]> {
    let query = active(createClient().from("attachments").select("*").eq("user_id", userId));
    if (parentType) query = query.eq("parent_type", parentType);
    if (parentId) query = query.eq("parent_id", parentId);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as AttachmentRecord[];
  },

  async uploadAttachment(userId: string, file: File, parent?: { type: string; id: string }): Promise<AttachmentRecord> {
    const client = createClient();
    const clientUuid = uuid();
    const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).replace(/[^.a-zA-Z0-9]/g, "").slice(0, 12) : "";
    const bucket = "user-uploads-private";
    const now = new Date();
    const path = `users/${userId}/attachments/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${clientUuid}${extension}`;
    const upload = await client.storage.from(bucket).upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (upload.error) throw upload.error;

    try {
      const { data, error } = await client.from("attachments").insert([{
        user_id: userId,
        client_uuid: clientUuid,
        bucket,
        path,
        mime_type: file.type || null,
        size: file.size,
        parent_type: parent?.type || null,
        parent_id: parent?.id || null,
        metadata: { file_name: file.name },
        version: 1,
      }]).select().single();
      if (error) throw error;
      return data as AttachmentRecord;
    } catch (error) {
      await client.storage.from(bucket).remove([path]);
      throw error;
    }
  },

  async deleteAttachment(userId: string, id: string): Promise<void> {
    const client = createClient();
    const { data, error } = await client.from("attachments").select("bucket,path").eq("id", id).eq("user_id", userId).maybeSingle();
    if (error) throw error;
    if (!data) return;
    await softDelete("attachments", userId, id);
    const removal = await client.storage.from(data.bucket).remove([data.path]);
    if (removal.error) throw removal.error;
  },
};
