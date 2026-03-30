import { apiFetch } from '../utils/api.js';
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDossierStore = defineStore('dossier', () => {
    const employees = ref([])
    const employeeDocuments = ref({})
    const activityLog = ref([])
    const adminUsers = ref([])
    const employeePagination = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })

    const globalStats = ref({
        totalEmployees: 0,
        employeesComplete: 0,
        employeesIncomplete: 0,
        totalDocs: 0,
        totalComplete: 0,
        totalIncomplete: 0,
        totalOptional: 0,
        completionPercentage: 0
    })

    const backendCompletenessReport = ref([])
    const backendCompletenessPagination = ref({ total: 0, page: 1, limit: 10, totalPages: 1 })
    const backendMissingReport = ref([])
    const backendMissingPagination = ref({ total: 0, page: 1, limit: 10, totalPages: 1 })
    const backendTopMissingDocs = ref([])
    const backendCategoryStats = ref([])

    const documentCategories = ref({
        identity: { label: 'Identity', documents: ['KTP', 'KK', 'NPWP', 'Akta Kelahiran', 'Buku Rekening'], singleDocs: ['KTP', 'KK', 'NPWP', 'Akta Kelahiran', 'Buku Rekening'], requiredDocs: ['KTP', 'KK', 'NPWP', 'Akta Kelahiran', 'Buku Rekening'], subTypes: {} },
        family: { label: 'Family', documents: ['Buku Nikah', 'KTP Istri', 'Akta Kelahiran Anak', 'KK Orang Tua', 'Mertua'], singleDocs: ['Buku Nikah', 'KTP Istri', 'KK Orang Tua', 'Mertua'], requiredDocs: ['Buku Nikah', 'KTP Istri', 'Akta Kelahiran Anak', 'KK Orang Tua', 'Mertua'], subTypes: {} },
        education: { label: 'Education', documents: ['Ijazah S1', 'Ijazah S2', 'Transkrip Nilai', 'Sertifikat Kompetensi'], singleDocs: ['Ijazah S1', 'Ijazah S2', 'Transkrip Nilai', 'Sertifikat Kompetensi'], requiredDocs: ['Ijazah S1', 'Ijazah S2', 'Transkrip Nilai', 'Sertifikat Kompetensi'], subTypes: {} },
        employment: {
            label: 'Employee Letters',
            documents: [
                'SK Pengangkatan Pegawai',
                'SK Promosi',
                'SK Non-Struktural',
                'SK Mutasi Struktural',
                'SK Perbantuan',
                'SK CDTP',
                'SK Mutasi OSA'
            ],
            singleDocs: ['SK Pengangkatan Pegawai'],
            requiredDocs: [],
            subTypes: {
                'SK Non-Struktural': ['Mutasi Dinas', 'Mutasi Jabatan', 'Definitif OJT'],
                'SK Mutasi Struktural': ['Caretaker', 'Definitif', 'Rotasi', 'Penyesuaian Jabatan', 'Lepas Jabatan']
            }
        }
    })

    // ── Fetch employees from PostgreSQL API (paginated) ──
    async function fetchEmployees({ page = 1, limit = 20, search = '', unit = '', docStatus = '' } = {}) {
        try {
            const params = new URLSearchParams({ page, limit })
            if (search) params.set('search', search)
            if (unit) params.set('unit', unit)
            if (docStatus) params.set('docStatus', docStatus)
            const res = await apiFetch(`/api/employees?${params}`)
            const json = await res.json()
            if (json.success) {
                employees.value = json.data.map(e => ({
                    id: e.id || e.employee_id,
                    name: e.name,
                    unit: e.unit,
                    position: e.position,
                    status: e.status,
                    photo: e.photo
                }))
                if (json.pagination) {
                    employeePagination.value = {
                        total: json.pagination.total,
                        page: json.pagination.page,
                        limit: json.pagination.limit,
                        totalPages: json.pagination.totalPages
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fetch employees', e)
        }
    }

    // ── Fetch single employee by ID from API ──
    async function fetchEmployee(id) {
        try {
            const res = await apiFetch(`/api/employees/${id}`)
            if (!res.ok) return null
            const json = await res.json()
            if (json.success && json.data) {
                const e = json.data
                const formatted = {
                    id: e.id || e.employee_id,
                    name: e.name,
                    unit: e.unit,
                    position: e.position,
                    status: e.status,
                    photo: e.photo
                }
                const existingIndex = employees.value.findIndex(emp => emp.id === formatted.id)
                if (existingIndex !== -1) {
                    employees.value[existingIndex] = formatted
                } else {
                    employees.value.push(formatted)
                }
                return formatted
            }
        } catch (e) {
            console.error('Failed to fetch single employee', e)
        }
        return null
    }

    // ── Generate document stubs for each employee ──
    function generateDocStubs(employeeId) {
        if (employeeDocuments.value[employeeId]) return

        const docs = {}
        for (const [cat, info] of Object.entries(documentCategories.value)) {
            const singleDocs = info.singleDocs || []
            const requiredDocs = info.requiredDocs || []
            docs[cat] = info.documents.map(name => ({
                name,
                status: 'incomplete',
                is_required: requiredDocs.includes(name),
                file: null,
                number: null,
                date: null,
                subType: null,
                isMultiple: !singleDocs.includes(name),
                versions: [] // populated from DB
            }))
        }
        employeeDocuments.value[employeeId] = docs
    }

    // ── Dashboard stats (computed from local data) ──
    async function fetchDashboardStats() {
        // Ensure docs stubs exist for all loaded employees
        for (const emp of employees.value) {
            generateDocStubs(emp.id)
        }

        // Use new detailed statistics API
        try {
            const res = await apiFetch('/api/reports/statistics')
            const json = await res.json()
            if (json.success) {
                const summary = json.data.summary;
                globalStats.value = {
                    totalEmployees: summary.totalEmployees,
                    employeesComplete: summary.employeesComplete || 0,
                    employeesIncomplete: summary.employeesIncomplete || summary.totalEmployees,
                    totalDocs: summary.totalDocs,
                    totalComplete: summary.totalComplete,
                    totalIncomplete: summary.totalIncomplete,
                    totalOptional: summary.totalOptional,
                    completionPercentage: summary.totalDocs ? ((summary.totalComplete || 0) / summary.totalDocs) * 100 : 0
                }
                backendCategoryStats.value = json.data.categories
            }
        } catch (e) {
            console.error('Failed to fetch stats', e)
        }
    }

    async function fetchCompletenessReport(unit = '', status = '', search = '', page = 1, limit = 10) {
        try {
            const params = new URLSearchParams();
            if (unit) params.append('unit', unit);
            if (status) params.append('status', status);
            if (search) params.append('search', search);
            params.append('page', page);
            params.append('limit', limit);
            const qs = params.toString();
            const res = await apiFetch(`/api/reports/completeness${qs ? '?' + qs : ''}`);
            const json = await res.json();
            if (json.success) {
                backendCompletenessReport.value = json.data.items;
                backendCompletenessPagination.value = json.data.pagination;
            }
        } catch (e) { console.error('Error fetching completeness report:', e) }
    }

    async function fetchMissingReport({ unit = '', type = '', status = '', docName = '', page = 1, limit = 10, format = 'flat', search = '' } = {}) {
        try {
            const params = new URLSearchParams();
            if (unit) params.append('unit', unit);
            if (type) params.append('type', type);
            if (status) params.append('status', status);
            if (docName) params.append('docName', docName);
            if (search) params.append('search', search);
            params.append('page', page);
            params.append('limit', limit);
            params.append('format', format);
            const res = await apiFetch(`/api/reports/missing?${params}`);
            const json = await res.json();
            if (json.success) {
                backendMissingReport.value = json.data.items || [];
                backendTopMissingDocs.value = json.data.topMissingDocs || [];
                backendMissingPagination.value = json.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
            }
        } catch (e) { console.error('Error fetching missing report:', e) }
    }

    async function fetchActivities() {
        try {
            const res = await apiFetch('/api/activities')
            if (!res.ok) {
                // API might not exist yet, use empty
                activityLog.value = []
                return
            }
            const acts = await res.json()
            activityLog.value = (Array.isArray(acts) ? acts : []).map(a => ({
                id: a.id,
                action: a.action,
                employeeId: a.employee_id,
                document: a.document_name,
                user: a.performed_by,
                date: a.createdAt || a.created_at
            }))
        } catch (e) {
            activityLog.value = []
        }
    }

    async function fetchAdminUsers() {
        try {
            const res = await apiFetch('/api/admin/users')
            if (!res.ok) {
                adminUsers.value = []
                return
            }
            adminUsers.value = await res.json()
        } catch (e) {
            adminUsers.value = []
        }
    }

    // ── Fetch employee docs from API + fill gaps with stubs ──
    async function fetchEmployeeDocs(id) {
        generateDocStubs(id)
        try {
            const res = await apiFetch(`/api/documents/${id}`)
            if (!res.ok) return
            const json = await res.json()
            if (json.success && Array.isArray(json.data)) {
                const docs = employeeDocuments.value[id]
                const seenDocs = new Set()
                for (const dbDoc of json.data) {
                    const cat = dbDoc.category
                    if (!docs[cat]) continue
                    const localDoc = docs[cat].find(d => d.name === dbDoc.document_name)
                    if (!localDoc) continue

                    localDoc.docId = dbDoc.id

                    if (localDoc.isMultiple) {
                        // Clear versions on first encounter to avoid duplicates on refetch
                        const seenKey = cat + '::' + localDoc.name
                        if (!seenDocs.has(seenKey)) {
                            localDoc.versions = []
                            seenDocs.add(seenKey)
                        }

                        // Populate versions array
                        if (dbDoc.status === 'complete') {
                            localDoc.versions.push({
                                id: dbDoc.version_id || dbDoc.id,
                                version: dbDoc.version,
                                number: dbDoc.document_number,
                                date: dbDoc.document_date,
                                file: dbDoc.original_filename,
                                filePath: dbDoc.file_path || null,
                                subType: dbDoc.sub_type || null
                            })
                        }

                        // Update top-level doc data from latest version
                        localDoc.status = dbDoc.status
                        localDoc.number = dbDoc.document_number
                        localDoc.date = dbDoc.document_date
                        localDoc.file = dbDoc.original_filename
                        localDoc.filePath = dbDoc.file_path || null
                        localDoc.subType = dbDoc.sub_type || null

                        // If any version exists, mark as complete
                        if (localDoc.versions.length > 0) {
                            localDoc.status = 'complete'
                        }
                    } else {
                        localDoc.status = dbDoc.status
                        localDoc.number = dbDoc.document_number
                        localDoc.date = dbDoc.document_date
                        localDoc.file = dbDoc.original_filename
                        localDoc.filePath = dbDoc.file_path || null
                        localDoc.subType = dbDoc.sub_type || null
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fetch docs from API', e)
        }
    }

    function getEmployeeDocStats(employeeId) {
        const docs = employeeDocuments.value[employeeId]
        if (!docs) return { total: 0, complete: 0, incomplete: 0, optional: 0, percentage: 0 }

        let total = 0, complete = 0, incomplete = 0, optional = 0
        for (const cat of ['identity', 'family', 'education', 'employment']) {
            for (const doc of docs[cat] || []) {
                if (doc.is_required) {
                    total++
                    if (doc.status === 'complete' || doc.status === 'optional') complete++
                    else incomplete++
                }
            }
        }

        const percentage = total > 0 ? Math.round((complete / total) * 100) : 100
        return { total, complete, incomplete, optional, percentage }
    }

    const docTypeDistribution = computed(() => {
        const counts = { identity: 0, family: 0, education: 0, employment: 0 }
        for (const empId in employeeDocuments.value) {
            const docs = employeeDocuments.value[empId]
            counts.identity += (docs.identity || []).filter(d => d.status === 'complete').length
            counts.family += (docs.family || []).filter(d => d.status === 'complete').length
            counts.education += (docs.education || []).filter(d => d.status === 'complete').length
            counts.employment += (docs.employment || []).filter(d => d.status === 'complete').length
        }
        return counts
    })

    const recentActivity = computed(() => activityLog.value.slice(0, 8))

    function getEmployee(id) {
        return employees.value.find(e => e.id === id)
    }

    function getEmployeeDocs(id) {
        return employeeDocuments.value[id] || null
    }

    function getDocumentActivity(employeeId, docName) {
        return activityLog.value.filter(a => String(a.employeeId) === String(employeeId) && a.document === docName)
    }

    // ── Upload document — persist to database ──
    async function uploadDocument(employeeId, category, docName, data, file) {
        try {
            const formData = new FormData()
            if (file) formData.append('file', file)
            if (data.number) formData.append('document_number', data.number)
            if (data.date) formData.append('document_date', data.date)
            if (data.subType) formData.append('sub_type', data.subType)

            const res = await apiFetch(`/api/documents/${employeeId}/${category}/${encodeURIComponent(docName)}`, {
                method: 'PUT',
                body: formData
            })
            const json = await res.json()

            // Update local state
            const docs = employeeDocuments.value[employeeId]
            if (docs && docs[category]) {
                const doc = docs[category].find(d => d.name === docName)
                if (doc) {
                    doc.status = 'complete'
                    doc.number = data.number || null
                    doc.date = data.date || null
                    doc.file = json.data?.original_filename || json.data?.original_filename || file?.name || data.name || docName
                    doc.filePath = json.data?.file_path || null
                    doc.subType = data.subType || null
                }
            }
        } catch (e) {
            console.error('Failed to upload document', e)
            // Still update locally as fallback
            const docs = employeeDocuments.value[employeeId]
            if (docs && docs[category]) {
                const doc = docs[category].find(d => d.name === docName)
                if (doc) {
                    doc.status = 'complete'
                    doc.number = data.number || null
                    doc.date = data.date || null
                    doc.file = file?.name || data.name || docName
                }
            }
        }
        await fetchDashboardStats()
        await fetchActivities()
    }

    async function replaceDocument(employeeId, category, docName, data, file) {
        return uploadDocument(employeeId, category, docName, data, file)
    }

    // ── Add new version of a multi-SK document ──
    async function addNewVersion(employeeId, category, docName, data, file) {
        try {
            // Find the document's DB id from the local store
            const docs = employeeDocuments.value[employeeId]
            let documentId = null
            if (docs && docs[category]) {
                const doc = docs[category].find(d => d.name === docName)
                if (doc) documentId = doc.docId
            }

            if (!documentId) {
                // No DB record yet — use the regular upload endpoint which does findOrCreate
                const formData = new FormData()
                if (data.number) formData.append('document_number', data.number)
                if (data.date) formData.append('document_date', data.date)
                if (data.subType) formData.append('sub_type', data.subType)
                if (file) formData.append('file', file)

                const res = await apiFetch(`/api/documents/${employeeId}/${category}/${encodeURIComponent(docName)}`, {
                    method: 'PUT',
                    body: formData
                })
                const json = await res.json()

                // Refetch to get the new docId and version data
                await fetchEmployeeDocs(employeeId)
            } else {
                // DB record exists — use the letters version endpoint
                const formData = new FormData()
                formData.append('document_id', documentId)
                formData.append('employee_id', employeeId)
                formData.append('doc_group', category)
                if (data.number) formData.append('letter_number', data.number)
                if (data.date) formData.append('letter_date', data.date)
                formData.append('letter_type', data.subType || docName)
                if (file) formData.append('file', file)

                const res = await apiFetch(`/api/letters/version`, {
                    method: 'POST',
                    body: formData
                })
                const json = await res.json()

                // Update local state
                if (docs && docs[category]) {
                    const doc = docs[category].find(d => d.name === docName)
                    if (doc && json.success && json.data) {
                        doc.status = 'complete'
                        doc.versions.push({
                            id: json.data.id,
                            version: json.data.version_number,
                            number: data.number || null,
                            date: data.date || null,
                            file: file?.name || null,
                            subType: data.subType || null
                        })
                    }
                }
            }
        } catch (e) {
            console.error('Failed to add new version', e)
        }
        await fetchDashboardStats()
        await fetchActivities()
    }

    // ── Delete a specific version by DB id ──
    async function deleteVersion(employeeId, category, docName, versionId) {
        try {
            const res = await apiFetch(`/api/letters/version/${versionId}`, { method: 'DELETE' })
            const json = await res.json()

            const docs = employeeDocuments.value[employeeId]
            if (docs && docs[category]) {
                const doc = docs[category].find(d => d.name === docName)
                if (doc) {
                    doc.versions = doc.versions.filter(v => v.id !== versionId)
                    if (doc.versions.length === 0) {
                        doc.status = 'incomplete'
                    }
                }
            }
        } catch (e) {
            console.error('Failed to delete version', e)
        }
        await fetchDashboardStats()
        await fetchActivities()
    }

    // ── Delete document (reset to incomplete) — persist to database ──
    async function deleteDocument(employeeId, category, docName) {
        try {
            await apiFetch(`/api/documents/${employeeId}/${category}/${encodeURIComponent(docName)}`, {
                method: 'DELETE'
            })
        } catch (e) {
            console.error('Failed to delete document', e)
        }
        const docs = employeeDocuments.value[employeeId]
        if (docs && docs[category]) {
            const doc = docs[category].find(d => d.name === docName)
            if (doc) {
                doc.status = 'incomplete'
                doc.file = null
                doc.number = null
                doc.date = null
            }
        }
        await fetchDashboardStats()
        await fetchActivities()
    }

    // ── Mark document as N/A — persist to database ──
    async function markDocOptional(employeeId, category, docName) {
        try {
            await apiFetch(`/api/documents/${employeeId}/${category}/${encodeURIComponent(docName)}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'optional' })
            })
        } catch (e) {
            console.error('Failed to mark document optional', e)
        }
        const docs = employeeDocuments.value[employeeId]
        if (docs && docs[category]) {
            const doc = docs[category].find(d => d.name === docName)
            if (doc) {
                doc.status = 'optional'
            }
        }
        await fetchDashboardStats()
        await fetchActivities()
    }

    // ── Unlock document from N/A back to incomplete — persist to database ──
    async function unlockDocOptional(employeeId, category, docName) {
        try {
            await apiFetch(`/api/documents/${employeeId}/${category}/${encodeURIComponent(docName)}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'incomplete' })
            })
        } catch (e) {
            console.error('Failed to unlock document', e)
        }
        const docs = employeeDocuments.value[employeeId]
        if (docs && docs[category]) {
            const doc = docs[category].find(d => d.name === docName)
            if (doc) {
                doc.status = 'incomplete'
            }
        }
        await fetchDashboardStats()
        await fetchActivities()
    }

    // ── Load document categories from API ──
    async function fetchDocumentCategories() {
        try {
            const res = await apiFetch('/api/doctypes')
            const json = await res.json()
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
                // Rebuild documentCategories from API data
                const cats = {
                    identity: { label: 'Identity', documents: [], singleDocs: [], requiredDocs: [], subTypes: {} },
                    family: { label: 'Family', documents: [], singleDocs: [], requiredDocs: [], subTypes: {} },
                    education: { label: 'Education', documents: [], singleDocs: [], requiredDocs: [], subTypes: {} },
                    employment: { label: 'Employee Letters', documents: [], singleDocs: [], requiredDocs: [], subTypes: {} }
                }
                // Map DB doc_group values to internal keys
                const groupMap = {
                    identity: 'identity',
                    family: 'family',
                    education: 'education',
                    employment: 'employment',
                    employee_letters: 'employment'
                }
                for (const row of json.data) {
                    const key = groupMap[row.doc_group] || row.doc_group
                    if (cats[key]) {
                        cats[key].documents.push(row.name)
                        // Track required docs
                        if (row.is_required) {
                            cats[key].requiredDocs.push(row.name)
                        }
                        // Build singleDocs from is_multiple flag
                        if (!row.is_multiple) {
                            cats[key].singleDocs.push(row.name)
                        }
                        // Populate subTypes from letter_types for any is_multiple doc
                        if (row.is_multiple && row.letter_types && Array.isArray(row.letter_types) && row.letter_types.length > 0) {
                            cats[key].subTypes[row.name] = row.letter_types
                        }
                    }
                }

                documentCategories.value = cats
                // Clear cached doc stubs so they regenerate with new categories
                employeeDocuments.value = {}
            }
        } catch (e) {
            console.error('Failed to fetch document categories, using defaults', e)
        }
    }

    // ── Initial Load ──
    async function init() {
        await fetchDocumentCategories()
        await fetchEmployees({ page: 1, limit: 20 })
        await fetchDashboardStats()
        await fetchActivities()
        await fetchAdminUsers()
    }

    return {
        backendCompletenessReport,
        backendCompletenessPagination,
        backendMissingReport,
        backendMissingPagination,
        backendTopMissingDocs,
        backendCategoryStats,
        fetchCompletenessReport,
        fetchMissingReport,
        employees,
        employeePagination,
        documentCategories,
        employeeDocuments,
        activityLog,
        adminUsers,
        globalStats,
        docTypeDistribution,
        recentActivity,
        getEmployee,
        getEmployeeDocs,
        getEmployeeDocStats,
        getDocumentActivity,
        uploadDocument,
        replaceDocument,
        addNewVersion,
        deleteVersion,
        deleteDocument,
        markDocOptional,
        unlockDocOptional,
        fetchEmployee,
        fetchEmployees,
        fetchDashboardStats,
        fetchActivities,
        fetchAdminUsers,
        fetchEmployeeDocs,
        fetchDocumentCategories,
        init
    }
})
