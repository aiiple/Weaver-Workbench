import Dexie from 'dexie'

const db = new Dexie('WeavingWorkbench')

db.version(1).stores({
  diagrams: 'id, groupId, createdAt, updatedAt',
  diagramGroups: 'id, createdAt',
  projects: 'id, diagramId, status, updatedAt, createdAt',
  crochetRecords: 'id, projectId, date, [projectId+date]',
})

// --- Diagrams ---

export async function getAllDiagrams() {
  return db.diagrams.orderBy('updatedAt').reverse().toArray()
}

export async function getDiagramsByGroup(groupId) {
  return db.diagrams.where('groupId').equals(groupId).sortBy('updatedAt')
}

export async function getDiagramById(id) {
  return db.diagrams.get(id)
}

export async function addDiagram(diagram) {
  const now = Date.now()
  return db.diagrams.add({ ...diagram, createdAt: now, updatedAt: now })
}

export async function updateDiagram(id, changes) {
  return db.diagrams.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteDiagram(id) {
  return db.diagrams.delete(id)
}

// --- Diagram Groups ---

export async function getAllGroups() {
  return db.diagramGroups.orderBy('createdAt').toArray()
}

export async function addGroup(group) {
  return db.diagramGroups.add({ ...group, createdAt: Date.now() })
}

export async function updateGroup(id, changes) {
  return db.diagramGroups.update(id, changes)
}

export async function deleteGroup(id) {
  return db.diagramGroups.delete(id)
}

// --- Projects ---

export async function getAllProjects() {
  return db.projects.orderBy('updatedAt').reverse().toArray()
}

export async function getProjectsByStatus(status) {
  return db.projects.where('status').equals(status).sortBy('updatedAt')
}

export async function getProjectById(id) {
  return db.projects.get(id)
}

export async function addProject(project) {
  const now = Date.now()
  return db.projects.add({ ...project, createdAt: now, updatedAt: now })
}

export async function updateProject(id, changes) {
  return db.projects.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteProject(id) {
  return db.projects.delete(id)
}

export async function getProjectsByDiagramId(diagramId) {
  return db.projects.where('diagramId').equals(diagramId).sortBy('updatedAt')
}

// --- Crochet Records ---

export async function addRecordIfNotExists(projectId, date) {
  const existing = await db.crochetRecords
    .where('[projectId+date]')
    .equals([projectId, date])
    .first()
  if (!existing) {
    return db.crochetRecords.add({ projectId, date })
  }
  return existing.id
}

export async function getRecordsByDateRange(startDate, endDate) {
  return db.crochetRecords
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray()
}

export async function getAllRecords() {
  return db.crochetRecords.toArray()
}

export { db }
