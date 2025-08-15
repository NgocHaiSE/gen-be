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
            console.log(Model);

            // Tạo điều kiện tìm kiếm
            let query = {};
            if (gene) {
                query.gene = gene;
            }
            // if (cdna) {
            //     query.cds = cdna;
            // }
            if (variant) {
                // Lấy phần trước dấu ':' để so khớp với nomenclature
                const variantPrefix = variant.split(':')[0];
                query.nomenclature = { $regex: variantPrefix, $options: 'i' };
            }

            // Nếu cả cdna và variant đều có thì tìm theo cả hai điều kiện
            const results = await Model.find(query);
            console.log(query);

            return res.status(200).json(results);
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    };



// Alternative version with more flexible nomenclature matching
    searchDrugAdvanced = async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * limit;
            
            const typeCancer = req.query.typeCancer || '';
            const nomenclature = req.body.nomenclature || req.query.nomenclature || '';
            const geneName = req.body.geneName || req.query.geneName || '';
            
            console.log('Advanced search - Cancer type:', typeCancer);
            console.log('Advanced search - Nomenclature:', nomenclature);
            console.log('Advanced search - Gene name:', geneName);

            const cancerModelMap = {
                'lung': LungDrugModel,
                'liver': LiverDrugModel,
                'hepatocellular_carcinoma': LiverDrugModel,
                'breast': BreastDrugModel,
                'colorectal': ColorectalDrugModel,
                'large_intestine': ColorectalDrugModel,
                'thyroid': ThyroidDrugModel
            };

            const DrugModel = cancerModelMap[typeCancer.toLowerCase()];
            
            if (!DrugModel) {
                return res.status(400).json({
                    success: false,
                    message: `Unsupported cancer type: ${typeCancer}`,
                    data: []
                });
            }

            // Build search query with multiple criteria
            let searchQuery = { $and: [] };

            // Search by nomenclature if provided
            if (nomenclature && nomenclature.trim() !== '') {
                // Extract different parts of nomenclature for flexible matching
                const nomenclatureParts = nomenclature.trim().split(/[():]/);
                const baseNomenclature = nomenclatureParts[0]; // e.g., "NM_004958.4"
                
                searchQuery.$and.push({
                    $or: [
                        { nomenclature: { $regex: baseNomenclature, $options: 'i' } },
                        { nomenclature: { $regex: nomenclature, $options: 'i' } }
                    ]
                });
            }

            // Search by gene name if provided
            if (geneName && geneName.trim() !== '') {
                searchQuery.$and.push({
                    $or: [
                        { gene_name: { $regex: geneName.trim(), $options: 'i' } },
                        { geneName: { $regex: geneName.trim(), $options: 'i' } }
                    ]
                });
            }

            // If no search criteria provided, return all drugs for the cancer type
            if (searchQuery.$and.length === 0) {
                searchQuery = {};
            }

            console.log('Final search query:', JSON.stringify(searchQuery, null, 2));

            const totalCount = await DrugModel.countDocuments(searchQuery);
            const drugs = await DrugModel
                .find(searchQuery)
                .skip(skip)
                .limit(limit)
                .sort({ gene_name: 1, nomenclature: 1 }) // Sort by gene name and nomenclature
                .lean();

            const formattedDrugs = drugs.map(drug => ({
                id: drug._id,
                gene_name: drug.gene_name || drug.geneName,
                nomenclature: drug.nomenclature,
                aa_mutation: drug.aa_mutation || drug.aaMutation,
                therapies: drug.therapies,
                pmid: drug.pmid,
                level: drug.level,
                // Include any additional fields that might be relevant
                cancer_type: typeCancer,
                ...drug
            }));

            const response = {
                success: true,
                page,
                limit,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                cancerType: typeCancer,
                searchCriteria: {
                    nomenclature: nomenclature || 'all',
                    geneName: geneName || 'all'
                },
                data: formattedDrugs
            };

            console.log(`Advanced search returning ${formattedDrugs.length} drugs for ${typeCancer} cancer`);
            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in advanced searchDrug:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during advanced drug search',
                error: error.message,
                data: []
            });
        }
    };

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

            let { geneName, drugName, cancerMainType, cancerSubType } =
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
            });

            const totalPages = Math.ceil(count / limit);

            const records = await drugInformationModel
                .find({
                    gene: new RegExp(geneName),
                    drug: new RegExp(drugName),
                    cancer_main_type: new RegExp(cancerMainType),
                    cancer_sub_type: new RegExp(cancerSubType),
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
                alteration: record.alteration,
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


    getDrug = (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const typeCancer = req.query.typeCancer || '';
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const IDTest = req.query.id;

        const geneQuery = req.query.gene?.trim().toLowerCase() || '';
        const drugQuery = req.query.drug?.trim().toLowerCase() || '';

        console.log("IDTest: ", IDTest);
        console.log("typeCancer: ", typeCancer);

        dataTestModel.find({ IDTest }, (err, items) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            if (items.length === 0) {
                return res.status(404).send('No patient mutation data found');
            }

            let patientGenes = items
                .map(item => item.Gene?.trim().toUpperCase())
                .filter(Boolean);
            patientGenes = [...new Set(patientGenes)];

            console.log("Patient genes: ", patientGenes);

            const drugFilePath = path.join(__dirname, `../../../data/dataDrug/${typeCancer}_asia_BE.json`);

            fs.promises.readFile(drugFilePath, 'utf8')
                .then(data => {
                    const drugs = JSON.parse(data);

                    const matchedDrugs = drugs.filter(drug =>
                        patientGenes.includes(drug['Gene name']?.trim().toUpperCase())
                    );

                    const groupedMap = new Map();

                    matchedDrugs.forEach(drug => {
                        const key = `${drug['Gene name']}_${drug['AA Mutation'] || 'NO_AA'}`;

                        if (!groupedMap.has(key)) {
                            groupedMap.set(key, {
                                ...drug,
                                Therapies: [drug.Therapies],
                                pmid: [drug.pmid],
                            });
                        } else {
                            const existing = groupedMap.get(key);
                            existing.Therapies.push(drug.Therapies);
                            existing.pmid.push(drug.pmid);
                        }
                    });

                    const groupedDrugs = Array.from(groupedMap.values()).map(item => ({
                        ...item,
                        Therapies: [...new Set(item.Therapies)].join(' | '),
                        pmid: [...new Set(item.pmid)].join(' | '),
                    }));

                    const filteredDrugs = groupedDrugs.filter(item => {
                        const geneName = item['Gene name']?.toLowerCase() || '';
                        const drugName = item['Therapies']?.toLowerCase() || '';
                        return geneName.includes(geneQuery) && drugName.includes(drugQuery);
                    });

                    const paginatedDrugs = filteredDrugs.slice(startIndex, endIndex);

                    const response = {
                        page,
                        limit,
                        totalItems: filteredDrugs.length,
                        totalPages: Math.ceil(filteredDrugs.length / limit),
                        dataDrug: paginatedDrugs,
                    };

                    console.log('Số thuốc sau khi gộp:', groupedDrugs.length);
                    res.json(response);
                })
                .catch(err => {
                    console.error('Error reading or parsing drug file: ', err);
                    res.status(500).send('Internal Server Error');
                });
        });
    };

    // searchDrug = (req, res) => {
    //     const limit = parseInt(req.query.limit) || 5;
    //     const typeCancer = req.query.typeCancer || '';
    //     const region = req.body.region[0];
    //     const geneName = req.body.geneName;
    //     const startIndex = 0;
    //     const endIndex = Infinity;
    //     console.log('region: ' + region);

    //     fs.readFile(
    //         `data/dataDrug/${typeCancer}_${region}_BE.json`,
    //         'utf8',
    //         (err, data) => {
    //             if (err) {
    //                 console.error(err);
    //                 return res.status(500).send('Internal Server Error');
    //             }

    //             const jsonData = JSON.parse(data);

    //             let filteredData = jsonData;
    //             if (geneName) {
    //                 filteredData = jsonData.filter(
    //                     (item) => item['Gene name'] === geneName,
    //                 );
    //             }

    //             const dataDrug = filteredData.slice(startIndex, endIndex);

    //             const response = {
    //                 limit,
    //                 totalItems: filteredData.length,
    //                 totalPages: Math.ceil(filteredData.length / limit),
    //                 dataDrug,
    //             };

    //             res.json(response);
    //         },
    //     );
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
