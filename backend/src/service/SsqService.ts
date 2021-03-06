import Base from './Base';
import {Document} from 'mongoose';

import {DB_NAME} from '../constant';
import {math, _} from '../utility';

const V = 1;

export default class extends Base {
  public async getAll(param): Promise<Document[]>{
    const db_ssq = this.getDBModel(DB_NAME.SSQ);

    const query:any = {};
    if(param.year){
      query.year = param.year;
    }

    if(param.blue){
      query.blue = param.blue;
    }
    
    if(param.red){
      if(param.red_type === 'and'){
        query.red = {
          $all : param.red.split(',')
        };
      }
      else{
        query.red = {
          $elemMatch : { $in : param.red.split(',')}
        };
      }
      
    }
    const opts: any = this.setQueryOptions(param);
    if(!opts.sort){
      opts.sort = {key: -1};
    }

    const ori_list =  await db_ssq.list(query, opts);
    const list = _.map(ori_list, (item)=>{
      if(!item.caculate || item.caculate._v < V){

        _.set(item, 'caculate', _.extend({
          _v : V
        }, this.calulateItem(item.data)));

      }
      

      return item;
    });
    

    return list;
  }





  private calulateItem(data: number[]){
    const red_arr = _.dropRight(data);
    const blue = _.last(data);

    const red_odd = math.odd(red_arr);
    const red_even = math.even(red_arr);

    // 1-11 12-22 23-33
    const s = math.inRange(red_arr, 1, 12);
    const m = math.inRange(red_arr, 12, 23);
    const b = math.inRange(red_arr, 23, 34);
    const rs = {
      sum : math.sum(red_arr),
      average : math.average(red_arr),
      middle : math.middle(red_arr),
      odd : red_odd,
      odd_len : _.size(red_odd),
      even : red_even,
      even_len : _.size(red_even),
      in_small : s,
      in_small_len : _.size(s),
      in_middle : m,
      in_middle_len : _.size(m),
      in_big : b,
      in_big_len : _.size(b)
    };

    return rs;
  }
}