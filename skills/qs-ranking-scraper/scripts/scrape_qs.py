import asyncio
from playwright.async_api import async_playwright
import json
import os

# Country name translation
COUNTRY_MAP = {
    'United States': '美国',
    'United Kingdom': '英国',
    'Switzerland': '瑞士',
    'Singapore': '新加坡',
    'Hong Kong SAR': '中国香港',
    'China (Mainland)': '中国',
    'Australia': '澳大利亚',
    'Canada': '加拿大',
    'Germany': '德国',
    'France': '法国',
    'Japan': '日本',
    'South Korea': '韩国',
    'Netherlands': '荷兰',
    'Taiwan': '中国台湾',
    'Belgium': '比利时',
    'Sweden': '瑞典',
    'Malaysia': '马来西亚',
    'New Zealand': '新西兰',
    'Ireland': '爱尔兰',
    'Italy': '意大利',
    'Saudi Arabia': '沙特阿拉伯',
    'Argentina': '阿根廷',
    'Denmark': '丹麦',
}

# University name translation (common ones)
NAME_MAP = {
    'Massachusetts Institute of Technology (MIT)': '麻省理工学院',
    'Imperial College London': '帝国理工学院',
    'Stanford University': '斯坦福大学',
    'University of Oxford': '牛津大学',
    'Harvard University': '哈佛大学',
    'University of Cambridge': '剑桥大学',
    'California Institute of Technology (Caltech)': '加州理工学院',
    'ETH Zurich': '苏黎世联邦理工学院',
    'UCL': '伦敦大学学院',
    'National University of Singapore (NUS)': '新加坡国立大学',
    'The University of Hong Kong': '香港大学',
    'Nanyang Technological University, Singapore (NTU Singapore)': '南洋理工大学',
    'Peking University': '北京大学',
    'Tsinghua University': '清华大学',
    'University of Pennsylvania': '宾夕法尼亚大学',
    'Cornell University': '康奈尔大学',
    'Yale University': '耶鲁大学',
    'The Chinese University of Hong Kong (CUHK)': '香港中文大学',
    'The University of New South Wales (UNSW Sydney)': '新南威尔士大学',
    'Johns Hopkins University': '约翰霍普金斯大学',
    'University of California, Berkeley (UCB)': '加州大学伯克利分校',
    'EPFL – École polytechnique fédérale de Lausanne': '洛桑联邦理工学院',
    'The University of Melbourne': '墨尔本大学',
    'University of Chicago': '芝加哥大学',
    'Technical University of Munich': '慕尼黑工业大学',
    'Fudan University': '复旦大学',
    'Princeton University': '普林斯顿大学',
    'The University of Sydney': '悉尼大学',
    'Australian National University (ANU)': '澳大利亚国立大学',
    'McGill University': '麦吉尔大学',
    'Monash University': '蒙纳士大学',
    'University of Toronto': '多伦多大学',
    'The Hong Kong University of Science and Technology': '香港科技大学',
    'Université PSL': '巴黎文理研究大学',
    'The University of Edinburgh': '爱丁堡大学',
    'Shanghai Jiao Tong University': '上海交通大学',
    "King's College London": '伦敦国王学院',
    'Seoul National University': '首尔国立大学',
    'The University of Tokyo': '东京大学',
    'The University of Manchester': '曼彻斯特大学',
    'The University of Queensland': '昆士兰大学',
    'Yonsei University': '延世大学',
    'Columbia University': '哥伦比亚大学',
    'Institut Polytechnique de Paris': '巴黎理工学院',
    'Northwestern University': '西北大学',
    'University of British Columbia': '不列颠哥伦比亚大学',
    'Zhejiang University': '浙江大学',
    'Delft University of Technology': '代尔夫特理工大学',
    'University of California, Los Angeles (UCLA)': '加州大学洛杉矶分校',
    'The Hong Kong Polytechnic University': '香港理工大学',
    'University of Michigan-Ann Arbor': '密歇根大学',
    'City University of Hong Kong (CityUHK)': '香港城市大学',
    'Korea University': '高丽大学',
    'National Taiwan University (NTU)': '台湾大学',
    'Carnegie Mellon University': '卡内基梅隆大学',
    'Universiti Malaya (UM)': '马来亚大学',
    'University of Bristol': '布里斯托大学',
    'New York University (NYU)': '纽约大学',
    'KU Leuven': '鲁汶大学',
    'University of Amsterdam': '阿姆斯特丹大学',
    'Ludwig-Maximilians-Universität München': '慕尼黑大学',
    'The London School of Economics and Political Science (LSE)': '伦敦政治经济学院',
    'Kyoto University': '京都大学',
    'KAIST': '韩国科学技术院',
    'Brown University': '布朗大学',
    'The University of Auckland': '奥克兰大学',
    'University of Warwick': '华威大学',
    'University of Birmingham': '伯明翰大学',
    'Duke University': '杜克大学',
    'Lund University': '隆德大学',
    'University of Texas at Austin': '德克萨斯大学奥斯汀分校',
    'Sorbonne University': '索邦大学',
    'University of Illinois Urbana-Champaign': '伊利诺伊大学香槟分校',
    'Trinity College Dublin, The University of Dublin': '都柏林三一学院',
    'Université Paris-Saclay': '巴黎萨克雷大学',
    'The University of Western Australia': '西澳大学',
    'University of Leeds': '利兹大学',
    'Adelaide University': '阿德莱德大学',
    'University of Glasgow': '格拉斯哥大学',
    'University of California, San Diego (UCSD)': '加州大学圣地亚哥分校',
    'KTH Royal Institute of Technology': '皇家理工学院',
    'The University of Sheffield': '谢菲尔德大学',
    'Durham University': '杜伦大学',
    'Universität Heidelberg': '海德堡大学',
    'Politecnico di Milano': '米兰理工大学',
    'The University of Technology Sydney (UTS)': '悉尼科技大学',
    'Uppsala University': '乌普萨拉大学',
    'Nanjing University': '南京大学',
    'University of Copenhagen': '哥本哈根大学',
    'Pennsylvania State University': '宾夕法尼亚州立大学',
    'University of Washington': '华盛顿大学',
    'Boston University': '波士顿大学',
    'The University of Osaka': '大阪大学',
    'University of Alberta': '阿尔伯塔大学',
    'Institute of Science Tokyo': '东京科学大学',
    'University of Nottingham': '诺丁汉大学',
    'Freie Universitaet Berlin': '柏林自由大学',
    'University of Zurich': '苏黎世大学',
}


async def scrape_page(page, page_num):
    """Scrape a single page of QS rankings"""
    url = f'https://www.topuniversities.com/world-university-rankings?page={page_num}'
    await page.goto(url, wait_until='domcontentloaded', timeout=120000)
    await page.wait_for_timeout(8000)
    
    text = await page.evaluate('document.body.innerText')
    lines = text.split('\n')
    
    universities = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if line.startswith('Rank'):
            rank_text = line.replace('Rank', '').replace('=', '').strip()
            
            if rank_text.isdigit():
                rank = int(rank_text)
                score = 0
                name = ''
                country = ''
                
                for j in range(i + 1, min(len(lines), i + 10)):
                    next_line = lines[j].strip()
                    
                    if next_line.startswith('Overall Score:'):
                        score_text = next_line.replace('Overall Score:', '').strip()
                        try:
                            score = float(score_text)
                        except:
                            score = 0
                        
                        if j + 1 < len(lines):
                            name = lines[j + 1].strip()
                        
                        if j + 2 < len(lines):
                            location = lines[j + 2].strip()
                            if ',' in location:
                                parts = location.split(',')
                                country = parts[-1].strip()
                            else:
                                country = location
                        
                        break
                
                if rank <= 100 and name and name not in ['Shortlist', 'Compare', 'Explore university']:
                    universities.append({
                        'rank': rank,
                        'name_en': name,
                        'name_zh': NAME_MAP.get(name, name),
                        'country_en': country,
                        'country_zh': COUNTRY_MAP.get(country, country),
                        'score': score
                    })
        
        i += 1
    
    return universities


async def scrape_qs_rankings(pages=4, output_file='qs_rankings.json'):
    """Scrape QS World University Rankings
    
    Args:
        pages: Number of pages to scrape (default 4, ~30 universities per page)
        output_file: Output JSON file path
    
    Returns:
        List of university dictionaries
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        all_universities = []
        
        for page_num in range(pages):
            print(f'Scraping page {page_num + 1}/{pages}...')
            unis = await scrape_page(page, page_num)
            all_universities.extend(unis)
            print(f'  Found {len(unis)} universities')
        
        await browser.close()
        
        # Remove duplicates and sort
        seen = set()
        unique = []
        for uni in all_universities:
            if uni['name_en'] not in seen:
                seen.add(uni['name_en'])
                unique.append(uni)
        
        unique.sort(key=lambda x: x['rank'])
        
        # Save to JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(unique[:100], f, ensure_ascii=False, indent=2)
        
        print(f'\nSaved {len(unique[:100])} universities to {output_file}')
        
        return unique[:100]


async def main():
    """Main entry point"""
    import sys
    
    pages = 4
    output_file = 'qs_rankings.json'
    
    if len(sys.argv) > 1:
        pages = int(sys.argv[1])
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    universities = await scrape_qs_rankings(pages, output_file)
    
    print('\nTop 10:')
    for uni in universities[:10]:
        print(f"  {uni['rank']:3d}. {uni['name_zh']:<20s} ({uni['country_zh']}) - Score: {uni['score']}")


if __name__ == '__main__':
    asyncio.run(main())
