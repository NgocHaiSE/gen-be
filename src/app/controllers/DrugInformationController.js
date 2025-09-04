const { _get_evi_mixed, _get_evi } = require('./sharedFunction/getEvidence');
const { json } = require('express');
const path = require('path');
const fs = require('fs');
const drugInformationModel = require('../models/DrugInformationModel');
//const testCaseModel = require('../models/TestCaseModel');
const dataTestModel = require('../models/DataTestModel');
const LungDrugModel = require('../models/drugCollections/LungDrugModel');
const LiverDrugModel = require('../models/drugCollections/LiverDrugModel');
const BreastDrugModel = require('../models/drugCollections/BreastDrugModel');
const ColorectalDrugModel = require('../models/drugCollections/ColorectalDrugModel');
const ThyroidDrugModel = require('../models/drugCollections/ThyroidDrugModel');


function buildVariantSearchConditions(variant) {
    const conditions = [];

    // Loại bỏ khoảng trắng và chuyển thành chữ thường để so sánh
    const cleanVariant = variant.trim();

    // Pattern 1: Tìm kiếm chính xác nomenclature
    conditions.push({
        nomenclature: { $regex: escapeRegex(cleanVariant), $options: 'i' }
    });

    // Pattern 2: Extract gene name từ variant nếu có dạng NM_xxx(GENE):c.xxx
    const geneFromVariantMatch = cleanVariant.match(/\(([^)]+)\)/);
    if (geneFromVariantMatch) {
        const extractedGene = geneFromVariantMatch[1];
        conditions.push({
            gene: { $regex: escapeRegex(extractedGene), $options: 'i' }
        });
    }

    // Pattern 3: Extract CDS part - tìm phần c.xxx
    const cdsMatch = cleanVariant.match(/c\.([^:\s]+)/);
    if (cdsMatch) {
        const cdsVariant = `c.${cdsMatch[1]}`;
        conditions.push({
            nomenclature: { $regex: escapeRegex(cdsVariant), $options: 'i' }
        });

        // Tìm trong cds field
        conditions.push({
            cds: { $regex: escapeRegex(cdsVariant), $options: 'i' }
        });

        // Tìm chỉ phần mutation không có c.
        conditions.push({
            nomenclature: { $regex: escapeRegex(cdsMatch[1]), $options: 'i' }
        });
    }

    // Pattern 4: Extract protein change - tìm phần p.xxx
    const proteinMatch = cleanVariant.match(/p\.([^:\s]+)/);
    if (proteinMatch) {
        const proteinVariant = `p.${proteinMatch[1]}`;
        conditions.push({
            nomenclature: { $regex: escapeRegex(proteinVariant), $options: 'i' }
        });

        // Tìm trong aa_mutation field
        conditions.push({
            aa_mutation: { $regex: escapeRegex(proteinVariant), $options: 'i' }
        });
    }

    // Pattern 5: Tìm theo RefSeq ID (NM_xxx)
    const refSeqMatch = cleanVariant.match(/(NM_\d+(?:\.\d+)?)/);
    if (refSeqMatch) {
        const refSeqId = refSeqMatch[1];
        conditions.push({
            nomenclature: { $regex: escapeRegex(refSeqId), $options: 'i' }
        });
    }

    // Pattern 6: Tách variant theo dấu ':' và tìm từng phần
    if (cleanVariant.includes(':')) {
        const parts = cleanVariant.split(':');
        parts.forEach(part => {
            if (part.trim()) {
                conditions.push({
                    nomenclature: { $regex: escapeRegex(part.trim()), $options: 'i' }
                });
            }
        });
    }

    // Pattern 7: Tìm mutation đơn giản (chỉ phần thay đổi nucleotide/amino acid)
    // Ví dụ: 672+62A>G từ c.672+62A>G
    const simpleMutationMatch = cleanVariant.match(/([0-9+\-*]+[A-Z]>[A-Z])/);
    if (simpleMutationMatch) {
        const simpleMutation = simpleMutationMatch[1];
        conditions.push({
            nomenclature: { $regex: escapeRegex(simpleMutation), $options: 'i' }
        });
        conditions.push({
            mutation: { $regex: escapeRegex(simpleMutation), $options: 'i' }
        });
    }

    // Pattern 8: Tìm position information
    const positionMatch = cleanVariant.match(/([0-9+\-*]+)/);
    if (positionMatch) {
        const position = positionMatch[1];
        conditions.push({
            position: { $regex: escapeRegex(position), $options: 'i' }
        });
    }

    return conditions;
}

// Helper function để escape special regex characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


class drugInformationController {

    searchDrugByVariant = async (req, res) => {
        try {
            const typeCancer = req.query.typeCancer;
            const { gene, variant } = req.body;
            console.log(req.body);

            const cancerModelMap = {
                'lung': LungDrugModel,
                'liver': LiverDrugModel,
                'hepatocellular_carcinoma': LiverDrugModel,
                'breast': BreastDrugModel,
                'colorectal': ColorectalDrugModel,
                'large_intestine': ColorectalDrugModel,
                'thyroid': ThyroidDrugModel
            };

            const Model = cancerModelMap[typeCancer];
            if (!Model) {
                return res.status(400).json({ message: 'Invalid cancer type' });
            }

            // Tạo điều kiện tìm kiếm
            let query = {};

            if (gene) {
                query.gene = gene;
            }

            if (variant) {
                const refSeqMatch = variant.match(/(NM_\d+(?:\.\d+)?)/);

                if (refSeqMatch) {
                    // nếu có refSeq thì dùng $and
                    const refSeqId = refSeqMatch[1];
                    console.log(`Searching for RefSeq ID: ${refSeqId}`);
                    query.$and = [
                        // { variant: { $regex: escapeRegex(variant), $options: 'i' } },
                        { nomenclature: { $regex: refSeqId, $options: 'i' } }
                    ];
                }
            }

            console.log(query);
            const results = await Model.find(query);

            return res.status(200).json(results);
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    };

    searchDrugByGene = async (req, res) => {
        try {
            const { gene } = req.body;
            console.log(req.body);

            const cancerModelMap = {
                'lung': LungDrugModel,
                'liver': LiverDrugModel,
                'hepatocellular_carcinoma': LiverDrugModel,
                'breast': BreastDrugModel,
                'colorectal': ColorectalDrugModel,
                'large_intestine': ColorectalDrugModel,
                'thyroid': ThyroidDrugModel
            };

            const Model = cancerModelMap[typeCancer];
            if (!Model) {
                return res.status(400).json({ message: 'Invalid cancer type' });
            }

            // Tạo điều kiện tìm kiếm
            let query = {};

            if (gene) {
                query.gene = gene;
            }

            console.log(query);
            const results = await Model.find(query);

            return res.status(200).json(results);
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    };

    searchDrug = async (req, res) => {

    }

    // ------> Begin <------- ONKOKB Drug fucntion
    findAll(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        drugInformationModel.countDocuments({}, function (err, count) {
            if (err) {
                return res.status(500).json({ error: 'Error!!!' });
            }

            drugInformationModel
                .find({})
                .skip(skip)
                .limit(limit)
                .exec(function (err, drugInformationModels) {
                    if (err) {
                        return res.status(500).json({ error: 'Error!!!' });
                    }

                    const totalPages = Math.ceil(count / limit);

                    res.json({
                        drugInformationModels,
                        currentPage: page,
                        totalPages,
                    });
                });
        });
    }

    findByID(req, res, next) {
        drugInformationModel.findById(req.params.id, (err, item) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            } else if (!item) {
                res.status(404).send('Item not found');
            } else {
                res.send(item);
            }
        });
    }

    search = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            let { geneName, drugName, cancerMainType, cancerSubType, variant } =
                req.body;
            console.log(req.body);
            geneName = geneName || '.*';
            drugName = drugName || '.*';
            cancerMainType = cancerMainType || '.*';
            cancerSubType = cancerSubType || '.*';

            console.log(geneName, drugName, cancerMainType, cancerSubType);

            const count = await drugInformationModel.countDocuments({
                gene: new RegExp(geneName),
                drug: new RegExp(drugName),
                cancer_main_type: new RegExp(cancerMainType),
                cancer_sub_type: new RegExp(cancerSubType),
                variant: new RegExp(alteration_name),
            });

            const totalPages = Math.ceil(count / limit);

            const records = await drugInformationModel
                .find({
                    gene: new RegExp(geneName),
                    drug: new RegExp(drugName),
                    cancer_main_type: new RegExp(cancerMainType),
                    cancer_sub_type: new RegExp(cancerSubType),
                    variant: new RegExp(alteration_name),
                })
                .select(
                    'gene drug alteration level cancer_main_type cancer_sub_type articles',
                )
                .skip(skip)
                .limit(limit)
                .lean();

            const mappedRecords = records.map((record) => ({
                gene: record.gene,
                drug: record.drug,
                alteration: record.alteration_name,
                level: record.level,
                cancer_main_type: record.cancer_main_type,
                cancer_sub_type: record.cancer_sub_type,
                articles: record.articles.map((articles) => articles.pmid),
            }));

            console.log(mappedRecords);
            return res.status(200).json({
                success: true,
                data: mappedRecords,
                totalPages: totalPages,
                currentPage: page,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error!!!' });
        }
    };

    // ------> End <------- ONKOKB Drug function

    // ------> Begin <------- New function for new drug data
    // getDrug = (req, res) => {
    //     const page = parseInt(req.query.page) || 1;
    //     const limit = parseInt(req.query.limit) || 5;
    //     const typeCancer = req.query.typeCancer || '';
    //     const startIndex = (page - 1) * limit;
    //     const endIndex = page * limit + 5;
    // 	const IDTest = req.query.id;
    // 	console.log("IDTest: ", IDTest);
    // 	//console.log(req.params)

    // 	dataTestModel.find({ IDTest }, (err, items) => {
    //         if (err) {
    //             console.log(err);
    //             //res.status(500).send(err);
    //         } else if (items.length === 0) {
    //             //res.status(404).send('No items found');
    //         } else {
    //             //res.json(items);
    // 			console.log("Tong so dot bien: ", items.length);
    // 			const scope = 'world';
    // 			const dataPrediction = _get_evi_mixed(items, scope);
    // 			// console.log(dataPrediction);
    //         }
    //     });

    //     fs.readFile(
    //         `data/dataDrug/${typeCancer}_asia_BE.json`,
    //         'utf8',
    //         (err, data) => {
    //             if (err) {
    //                 console.error(err);
    //                 res.status(500).send('Internal Server Error');
    //                 return;
    //             }
    //             const jsonData = JSON.parse(data);
    //             const dataDrug = jsonData.slice(startIndex, endIndex);

    //             const response = {
    //                 page,
    //                 limit,
    //                 totalItems: jsonData.length,
    //                 totalPages: Math.ceil(jsonData.length / limit),
    //                 dataDrug,
    //             };
    //             console.log('response: ', response);
    //             res.json(response);
    //         },
    //     );
    // };

    getDrugBasic = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const typeCancer = req.query.typeCancer || '';
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            if (!typeCancer) {
                return res.status(400).json({ error: 'Missing typeCancer query parameter' });
            }

            const drugFilePath = path.join(
                __dirname,
                `../../../data/dataDrug/${typeCancer}_asia_BE.json`
            );

            const data = await fs.promises.readFile(drugFilePath, 'utf8');
            const jsonData = JSON.parse(data);

            const paginatedData = jsonData.slice(startIndex, endIndex);

            const response = {
                page,
                limit,
                totalItems: jsonData.length,
                totalPages: Math.ceil(jsonData.length / limit),
                dataDrug: paginatedData,
            };

            return res.json(response);
        } catch (err) {
            console.error('Error loading drug data:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };


    getDrug = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            console.log(req.body);

            const typeCancer = (req.body.typeCancer || '').toLowerCase();
            const qGene = req.body.gene;
            let variants = [];

            // Nhận variants từ query (?variants=...) JSON-string / CSV / lặp
            const qVariants = req.body.variants;
            if (qVariants) {
                if (Array.isArray(qVariants)) {
                    variants = qVariants.map(v => String(v)).filter(Boolean);
                } else if (typeof qVariants === 'string') {
                    try {
                        const parsed = JSON.parse(qVariants);
                        variants = Array.isArray(parsed) ? parsed : [];
                    } catch {
                        variants = qVariants.split(',').map(s => s.trim()).filter(Boolean);
                    }
                }
            }
            // Nếu có cặp đơn lẻ gene + variant
            // if (!variants.length && qVariant) {
            //     variants = [qVariant];
            // }

            if (!variants.length) {
                return res.status(400).json({ error: 'Missing variants or variant in query' });
            }

            // Chọn Model theo typeCancer giống searchDrugByVariant
            const cancerModelMap = {
                'lung': LungDrugModel,
                'liver': LiverDrugModel,
                'hepatocellular_carcinoma': LiverDrugModel,
                'breast': BreastDrugModel,
                'colorectal': ColorectalDrugModel,
                'large_intestine': ColorectalDrugModel,
                'thyroid': ThyroidDrugModel
            };
            const Model = cancerModelMap[typeCancer];
            if (!Model) {
                return res.status(400).json({ error: 'Invalid or missing typeCancer' });
            }

            // Ghép OR cho nhiều biến thể; mỗi biến thể là một $and gồm:
            // - (optional) gene (nếu gửi global gene)
            // - các điều kiện từ buildVariantSearchConditions(variant)
            // - ưu tiên refSeqId (NM_...) -> nomenclature
            const orBlocks = [];
            for (const raw of variants) {
                const v = typeof raw === 'string' ? raw : (raw?.variant || raw?.alteration || '');
                if (!v) continue;

                const andConds = [];

                // Gene toàn cục (nếu có) — giống searchDrugByVariant khi người dùng gửi gene
                if (qGene) andConds.push({ gene: qGene });

                // Ưu tiên refSeqId nếu có (NM_1234.x)
                const refSeqMatch = String(v).match(/(NM_\d+(?:\.\d+)?)/);
                if (refSeqMatch) {
                    const refSeqId = refSeqMatch[1];
                    andConds.push({ nomenclature: { $regex: refSeqId, $options: 'i' } });
                }

                // Các pattern tổng hợp (nomenclature, p./c./aa_mutation/position, …)
                const patterns = buildVariantSearchConditions(String(v));
                andConds.push(...patterns);

                // Loại bỏ trùng key giống nhau để tránh $and quá dài (tuỳ ý, không bắt buộc)
                // Ở đây giữ nguyên để giữ độ “bắt” cao.

                orBlocks.push({ $and: andConds });
            }

            if (!orBlocks.length) {
                return res.status(400).json({ error: 'No valid variant conditions' });
            }

            const query = { $or: orBlocks };

            const records = await Model
                .find(query)
                .select('gene alteration drug level cancer_main_type cancer_sub_type articles')
                .lean();

            // Gom nhóm theo gene + alteration (giữ articles là danh sách pmid)
            const groupedMap = new Map();
            for (const r of records) {
                const key = `${r.gene || 'NO_GENE'}_${r.alteration || 'NO_AA'}`;
                if (!groupedMap.has(key)) {
                    groupedMap.set(key, {
                        gene: r.gene,
                        alteration: r.alteration,
                        level: r.level,
                        cancer_main_type: r.cancer_main_type,
                        cancer_sub_type: r.cancer_sub_type,
                        drug: Array.isArray(r.drug) ? [...r.drug] : (r.drug ? [r.drug] : []),
                        articles: (r.articles || []).map(a => a.pmid),
                    });
                } else {
                    const ex = groupedMap.get(key);
                    ex.drug = [...new Set(ex.drug.concat(r.drug || []))];
                    ex.articles = [...new Set(ex.articles.concat((r.articles || []).map(a => a.pmid)))];
                }
            }

            const grouped = Array.from(groupedMap.values());
            const paginated = grouped.slice(startIndex, endIndex);

            return res.json({
                page,
                limit,
                totalItems: grouped.length,
                totalPages: Math.ceil(grouped.length / limit),
                dataDrug: paginated,
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };



    // getDrug = (req, res) => {
    //     const page = parseInt(req.query.page) || 1;
    //     const limit = parseInt(req.query.limit) || 5;
    //     const typeCancer = req.query.typeCancer || '';
    //     const startIndex = (page - 1) * limit;
    //     const endIndex = page * limit;
    //     const IDTest = req.query.id;

    //     const geneQuery = req.query.gene?.trim().toLowerCase() || '';
    //     const drugQuery = req.query.drug?.trim().toLowerCase() || '';

    //     console.log("IDTest: ", IDTest);
    //     console.log("typeCancer: ", typeCancer);

    //     dataTestModel.find({ IDTest }, (err, items) => {
    //         if (err) {
    //             console.error(err);
    //             return res.status(500).send('Internal Server Error');
    //         }

    //         if (items.length === 0) {
    //             return res.status(404).send('No patient mutation data found');
    //         }

    //         let patientGenes = items
    //             .map(item => item.Gene?.trim().toUpperCase())
    //             .filter(Boolean);
    //         patientGenes = [...new Set(patientGenes)];

    //         console.log("Patient genes: ", patientGenes);

    //         const drugFilePath = path.join(__dirname, `../../../data/dataDrug/${typeCancer}_asia_BE.json`);

    //         fs.promises.readFile(drugFilePath, 'utf8')
    //             .then(data => {
    //                 const drugs = JSON.parse(data);

    //                 const matchedDrugs = drugs.filter(drug =>
    //                     patientGenes.includes(drug['Gene name']?.trim().toUpperCase())
    //                 );

    //                 const groupedMap = new Map();

    //                 matchedDrugs.forEach(drug => {
    //                     const key = `${drug['Gene name']}_${drug['AA Mutation'] || 'NO_AA'}`;

    //                     if (!groupedMap.has(key)) {
    //                         groupedMap.set(key, {
    //                             ...drug,
    //                             Therapies: [drug.Therapies],
    //                             pmid: [drug.pmid],
    //                         });
    //                     } else {
    //                         const existing = groupedMap.get(key);
    //                         existing.Therapies.push(drug.Therapies);
    //                         existing.pmid.push(drug.pmid);
    //                     }
    //                 });

    //                 const groupedDrugs = Array.from(groupedMap.values()).map(item => ({
    //                     ...item,
    //                     Therapies: [...new Set(item.Therapies)].join(' | '),
    //                     pmid: [...new Set(item.pmid)].join(' | '),
    //                 }));

    //                 const filteredDrugs = groupedDrugs.filter(item => {
    //                     const geneName = item['Gene name']?.toLowerCase() || '';
    //                     const drugName = item['Therapies']?.toLowerCase() || '';
    //                     return geneName.includes(geneQuery) && drugName.includes(drugQuery);
    //                 });

    //                 const paginatedDrugs = filteredDrugs.slice(startIndex, endIndex);

    //                 const response = {
    //                     page,
    //                     limit,
    //                     totalItems: filteredDrugs.length,
    //                     totalPages: Math.ceil(filteredDrugs.length / limit),
    //                     dataDrug: paginatedDrugs,
    //                 };

    //                 console.log('Số thuốc sau khi gộp:', groupedDrugs.length);
    //                 res.json(response);
    //             })
    //             .catch(err => {
    //                 console.error('Error reading or parsing drug file: ', err);
    //                 res.status(500).send('Internal Server Error');
    //             });
    //     });
    // };

    getEvidenceAsiaMixed(req, res) {
        const jsonObject = req.body;
        const scope = 'asia';
        const dataPrediction = _get_evi_mixed(jsonObject, scope);
        return res.status(200).json({
            data: dataPrediction,
            success: true,
        });
    }
    getEvidenceWorldMixed(req, res) {
        const jsonObject = req.body;
        const scope = 'world';
        const dataPrediction = _get_evi_mixed(jsonObject, scope);
        return res.status(200).json({
            data: dataPrediction,
            success: true,
        });
    }
    getEvidence(req, res) {
        const condition = req.body.condition;
        const gene = req.body.gene;
        const protein = req.body.protein;
        const dataPrediction = _get_evi(condition, gene, protein);
        return res.status(200).json({
            data: dataPrediction,
            success: true,
        });
    }
}

module.exports = new drugInformationController();
