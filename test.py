import json
import requests
from xml.etree import ElementTree
from datetime import datetime
import sys
from pymongo import MongoClient

def fetch_variant_id(rsid):
    esearch_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=clinvar&term={rsid}"
    esearch_response = requests.get(esearch_url)
    esearch_tree = ElementTree.fromstring(esearch_response.content)
    clinvar_id = esearch_tree.find(".//Id")
    if clinvar_id is not None:
        return clinvar_id.text
    return None

def fetch_variant_details(variant_id):
    esummary_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id={variant_id}"
    esummary_response = requests.get(esummary_url)
    esummary_tree = ElementTree.fromstring(esummary_response.content)
    
    # Extract RS-ID specifically from dbSNP
    rsid = "not found"
    variation_xrefs = esummary_tree.findall(".//variation_xref")
    for xref in variation_xrefs:
        db_source = xref.find("db_source")
        db_id = xref.find("db_id")
        if db_source is not None and db_id is not None:
            if db_source.text == "dbSNP":
                rsid = f"rs{db_id.text}"
                break
    
    # Extracting other relevant details
    details = {
        "Gene": esummary_tree.find(".//gene_sort").text if esummary_tree.find(".//gene_sort") is not None else "not found",
        "Nucleotide": esummary_tree.find(".//variation_name").text if esummary_tree.find(".//variation_name") is not None else "not found",
        "Variant Rate": "not found",
        "Drug Response": esummary_tree.find(".//germline_classification/description").text if esummary_tree.find(".//germline_classification/description") is not None else "not found",
        "Protein": (
            esummary_tree.find(".//variation_name").text.split(" (")[-1].replace(")", "") 
            if esummary_tree.find(".//variation_name") is not None and " (" in esummary_tree.find(".//variation_name").text
            else (
                esummary_tree.find(".//protein_change").text 
                if esummary_tree.find(".//protein_change") is not None 
                else "not found"
            )
        ),
        "Variant Type": esummary_tree.find(".//variant_type").text if esummary_tree.find(".//variant_type") is not None else "not found",
        "RS-ID": rsid,
        "Position (GRCh38)": "not found",
        "Chromosome": esummary_tree.find(".//assembly_set[status='current']//chr").text
    }
    
    
    allele_freqs = esummary_tree.findall(".//allele_freq")
    gnomad_freqs = []
    for af in allele_freqs:
        source_elem = af.find("source")
        value_elem = af.find("value")
        if source_elem is not None and value_elem is not None and "gnomAD" in source_elem.text:
            try:
                freq = float(value_elem.text)
                gnomad_freqs.append(freq)
            except (ValueError, TypeError):
                continue
    if gnomad_freqs:
        details["Variant Rate"] = f"{max(gnomad_freqs) * 100:.2f}%"
    else:
        if allele_freqs:
            fallback_value = allele_freqs[0].find("value")
            if fallback_value is not None:
                try:
                    freq = float(fallback_value.text)
                    details["Variant Rate"] = f"{freq * 100:.2f}%"
                except (ValueError, TypeError):
                    details["Variant Rate"] = "not found"
        else:
            details["Variant Rate"] = "not found"
    # Extract position information and format as start-end
    start_pos = esummary_tree.find(".//assembly_set[status='current']//start")
    stop_pos = esummary_tree.find(".//assembly_set[status='current']//stop")
    
    if start_pos is not None and stop_pos is not None:
        details["Position (GRCh38)"] = f"{start_pos.text}-{stop_pos.text}"
    elif start_pos is not None:
        details["Position (GRCh38)"] = f"{start_pos.text}-{start_pos.text}"
    
    return details

def parse_vcf_line(vcf_line):
    fields = vcf_line.split()
    info_field = fields[7]
    format_field = fields[8]
    sample_field = fields[9]

    # Parse the INFO field
    info_dict = dict(item.split('=') for item in info_field.split(';') if '=' in item)
    
    # Parse the FORMAT and SAMPLE fields
    format_keys = format_field.split(':')
    sample_values = sample_field.split(':')

    format_dict = dict(zip(format_keys, sample_values))

    # Extract the required values
    variant_rate = info_dict.get('AF', '-')
    read_depth_info = info_dict.get('DP', '-')
    read_depth_format = format_dict.get('DP', '-')

    return variant_rate, read_depth_info, read_depth_format

def parse_vcf_file(vcf_file_path, id_test):
    mutations = []
    
    with open(vcf_file_path, 'r') as file:
        
        for line in file:
            
            if line.startswith('#'):
                continue
            fields = line.split()
            chrom, pos, rsid, ref, alt = fields[:5]

            if rsid == '.':
                continue

            variant_rate, _, read_depth_format = parse_vcf_line(line)
            
            variant_id = fetch_variant_id(rsid)
            if variant_id is None:
                continue
            
            variant_details = fetch_variant_details(variant_id)
            
            try:
                variant_rate_value = float(variant_rate.replace(',', '.')) * 100 if variant_rate != '-' else variant_rate
                variant_rate_formatted = f"{variant_rate_value:.2f}%" if variant_rate != '-' else variant_rate
            except ValueError:
                variant_rate_formatted = "Invalid"

            mutation = {
                "IDTest": id_test,
                "Gene": variant_details['Gene'],
                "RS_ID": variant_details['RS-ID'],
                "Nucleotide": variant_details['Nucleotide'],
                "Protein": variant_details['Protein'],
                "VariationType": variant_details['Variant Type'],
                "VariantLength": str(len(alt) - len(ref)),  # Convert to string to match the schema
                "Position": variant_details['Position (GRCh38)'],
                "Chromosome": variant_details['Chromosome'],
                "DrugResponse": variant_details['Drug Response'],
                "VariantRate": variant_details['Variant Rate'],
                "ReadDepth": read_depth_format,
                "createAt": datetime.now().isoformat(),
                "updateAt": datetime.now().isoformat(),
                "__v": 0,
                "mutations": []
                }
            mutations.append(mutation)
    
    return mutations

def main(id_test):
    vcf_file_path = "output.vcf"
    # Connect to MongoDB
    # client = MongoClient('mongodb://root:abc@45.117.177.243:27017/PROJECTUT?retryWrites=true&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1')
    client = MongoClient('mongodb://root:123@127.0.0.1:27017/PROJECTUT?retryWrites=true&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1')
    # db = client['PROJECTUT']
    db = client['PROJECTUT']
    collection = db['data_tests']
    
    mutations = parse_vcf_file(vcf_file_path, id_test)
    print(mutations)

    # Insert into MongoDB and let it generate _id
    collection.insert_many(mutations)
    print("Data inserted into MongoDB successfully")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python clinvar.py <IDTest>")
        sys.exit(1)
    
    id_test = sys.argv[1]
    
    main(id_test)

# def parse_vcf_line(vcf_line):
#     fields = vcf_line.split()
#     info_field = fields[7]
#     format_field = fields[8]
#     sample_field = fields[9]

#     # Parse the INFO field
#     info_dict = dict(item.split('=') for item in info_field.split(';') if '=' in item)
    
#     # Parse the FORMAT and SAMPLE fields
#     format_keys = format_field.split(':')
#     sample_values = sample_field.split(':')

#     format_dict = dict(zip(format_keys, sample_values))

#     # Extract the required values
#     variant_rate = info_dict.get('AF', '-')
#     read_depth_info = info_dict.get('DP', '-')
#     read_depth_format = format_dict.get('DP', '-')

#     return variant_rate, read_depth_info, read_depth_format

# def parse_vcf_file(vcf_file_path, id_test):
#     mutations = []
    
#     with open(vcf_file_path, 'r') as file:
        
#         for line in file:
            
#             if line.startswith('#'):
#                 continue
#             fields = line.split()
#             chrom, pos, rsid, ref, alt = fields[:5]

#             if rsid == '.':
#                 continue

#             variant_rate, _, read_depth_format = parse_vcf_line(line)
            
#             variant_id = fetch_variant_id(rsid)
#             if variant_id is None:
#                 continue
            
#             variant_details = fetch_variant_details(variant_id)
            
#             try:
#                 variant_rate_value = float(variant_rate.replace(',', '.')) * 100 if variant_rate != '-' else variant_rate
#                 variant_rate_formatted = f"{variant_rate_value:.2f}%" if variant_rate != '-' else variant_rate
#             except ValueError:
#                 variant_rate_formatted = "Invalid"

#             mutation = {
#                 "IDTest": id_test,
#                 "Gene": variant_details['Gene'],
#                 "RS_ID": variant_details['RS-ID'],
#                 "Nucleotide": variant_details['Nucleotide'],
#                 "Protein": variant_details['Protein'],
#                 "VariationType": variant_details['Variant Type'],
#                 "VariantLength": str(len(alt) - len(ref)),  # Convert to string to match the schema
#                 "Position": variant_details['Position (GRCh38)'],
#                 "DrugResponse": variant_details['Drug Response'],
#                 "VariantRate": variant_details['Variant Rate'],
#                 "ReadDepth": read_depth_format,
#                 "createAt": datetime.now().isoformat(),
#                 "updateAt": datetime.now().isoformat(),
#                 "__v": 0,
#                 "mutations": []
#                 }
#             mutations.append(mutation)
    
#     return mutations

# def main(id_test):
#     vcf_file_path = "output.vcf"
#     # Connect to MongoDB
#     # client = MongoClient('mongodb://root:abc@45.117.177.243:27017/PROJECTUT?retryWrites=true&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1')
#     client = MongoClient('mongodb://root:123@127.0.0.1:27017/PROJECTUT?retryWrites=true&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1')
#     # db = client['PROJECTUT']
#     db = client['PROJECTUT']
#     collection = db['data_tests']
    
#     mutations = parse_vcf_file(vcf_file_path, id_test)
#     print(mutations)

#     # Insert into MongoDB and let it generate _id
#     collection.insert_many(mutations)
#     print("Data inserted into MongoDB successfully")

# if __name__ == "__main__":
#     if len(sys.argv) != 2:
#         print("Usage: python clinvar.py <IDTest>")
#         sys.exit(1)
    
#     id_test = sys.argv[1]
    
#     main(id_test)

